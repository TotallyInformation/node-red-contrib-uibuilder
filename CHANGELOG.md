---
typora-root-url: docs/images
created: 2017-04-18 16:53:00
updated: 2025-09-24 20:10:00
---

# Changelog

Please see the documentation for archived changelogs - a new archive is produced for each major version. Check the [roadmap](./docs/roadmap.md) for future developments.

Please see the roadmap in the docs for the backlog of future planned developments.


## Compatibility of current release

* Servers:
  * Node-RED: v4+
  * Node.js: v18+ LTS
  * Platforms: Linux, Windows, MacOS, Raspberry Pi, Docker, etc.
* Browsers: 
  * CSS - 0.12% or above of global usage but not Internet Explorer ([ref.](https://browserslist.dev/?q=Pj0wLjEyJSwgbm90IGllID4gMA%3D%3D)). The uncompiled CSS should work in all current mainstream browsers. The compiled CSS (`uib-brand.min.css`) should work in browsers back to early 2019, possibly before. Enforced by [LightningCSS](https://lightningcss.com/).
  * JavaScript - ES6+ so should work in all current mainstream browsers. The compiled JS (`uibuilder.min.js`) should work in browsers back to early 2019, possibly before. Enforced by [ESBuild](https://esbuild.github.io/).

------------

<!-- ## [Unreleased](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.1.0...main) -->

## v7.6.0

[Code commits since last release](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.5.0...v7.6.0).

### 📌 Highlights

### Documentation

* The sidebar of documentation page links now scrolls the current page link into view.
* The sidebar top-level entries that have children are now collapsible sections. Added because the documentaiton continues to grown.
* The sidebar expand/collapse state for each section is remembered across page loads.
* **Fixed** [Issue #575](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/575) - Broken CSS loads.

### uib-cache node

* **Added** several techniques to reduce resource overheads when the cache is receiving very large numbers of inputs.

### uib-elements node

* **FIXED** [Issue 580](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/580) - Missing data could cause a Node-RED crash. Additional checks and try/catch trap added.

### `uib-brand.css` front-end styles

* **Added** `.visually-hidden` class for elements hidden from sighted users but still accessible to screen readers. Use for skip links, form explanations, and status updates otherwise not needed for sighted users.
* **FIXED** Misconfigured fieldset border.

### uibuilder client library

* **NEW** Added the `_receivedHRtime` property to messages received from the Node-RED server. This is a high-resolution timestamp (in milliseconds) of when the message was received. It can be used to measure latency and performance. It uses the [`performance.now()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) method which provides sub-millisecond accuracy. The value is the elapsed time since page navigation started.

### Development changes

* **NEW** npm script `bugfix-worktree` - creates a new git worktree for bugfix branches. This allows you to work on a bug fix in a separate directory while keeping your current dev branch work intact. You can have both directories open simultaneously without needing to stash changes or switch branches. When you're done with the bug fix, you can commit, push, create a PR, and then remove the worktree.


## v7.5.0

[Code commits since last release](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.4.0...v7.5.0).

NOTE: If using the `uibRouter` SPA client library, please note that the startup processing has changed slightly. You may now get an error if you have specified a route container element but it doesn't exist. Unfortunately, some of the examples shared have this error and so will now break unless that container element id is changed. Sorry about that. The built-in router/SPA example has been updated to reflect this change.

### 📌 Highlights

* New "Quick Start" guides added to the documentation. Two main approaches: no-code/low-code and low-code/custom code. Each approach has a step-by-step guide to get you started quickly. In addition, several documentation pages now have rotating "tips" selected randomly from a list, they change every 15 seconds.

* A new browser overlay **notification message feature** available. Using `showOverlay` allows messages of different types (info, success, warning, and error) to be displayed to users in the browser. This can be triggered from Node-RED or from front-end code. Messages can be auto-dismissed after a few seconds (the default), or retained until manually dismissed.

* The `uibuilder` node now has an **extra tab** "scripts" which lets you *run npm scripts* defined in your instance root's package.json file.
  
  These can be any script that can be run on the host OS. They run in the OS's default shell. Output from the script is captured and returned to Node-RED in the panel beneath the list of scripts. When a script is running, a "Kill Script" button is visible, clicking this wil abort the script immediately.

* The 🌐 emoji is now in use consistently across UIBUILDER. You will find it in announcements on the forum, log messages, on the web page open buttons in the Editor and elsewhere. I am using this because emoji's are single-characters and usable anywhere that UTF-8 text is usable.

* uibuilder installation will now **ERROR** and stop if the Node-RED userDir folder is not writable. This is to prevent the uibuilder node from being misconfigured and not working correctly. The error message will show the userDir folder that is not writable.

* When using uibuilder's custom web server option, you now have the option to create a `<uibRoot>/.public` folder. It is served as the root URL. This is where you can place static files that you want to serve from the custom web server. The folder will be created automatically if it does not exist. You can also use this folder to serve static files such as images, CSS, and JavaScript files. Create an `index.html` file in the folder to serve a custom root home page. The folder is not served if you are using the default Node-RED web server (Use Node-RED's public folder for that).

* The documentation now has a **"Tips" page** that rotates through a selection of tips. I will be adding more tips over time. If you have any tips that you think would be useful, please let me know.

### Example flows

* **NEW** `uib-basic` An inject node to a uibuilder node with debug nodes on each output. Inputs and outputs minimised. Outputs show full msg and show msg count.
* **UPDATED** Client-side code > FE Router Test. A complete front-end router example flow including html, js and route partials.
* **UPDATE** "Remote Commands" renamed to "Control UI from Node-RED" and refreshed. New showOverlay notifications included.

### uibuilder node

* **NEW** Two new Editor actions have been added. This enables you to run these actions from keyboard shortcuts.

  * `open-uibuilder-site` - opens the selected uibuilder instances web site in a new browser tab.
  * `edit-uibuilder-site` - opens the selected uibuilder instances source folder in your full IDE. THe configuration for this comes from the "Code Editor URL" in the node's advanced properties tab (defaulting to VS Code).

* Updated the buttons on the Editor config panel's top button bar to use icons instead of text. Note that the wireframe globe is now used consistently across uibuilder.

* **NEW** An extra tab "scripts" has been added. This lets you run npm scripts defined in your instance root's package.json file.
  
  These can be any script that can be run on the host OS. They run in the OS's default shell. Output from the script is captured and returned to Node-RED in the panel beneath the list of scripts. When a script is running, a "Kill Script" button is visible, clicking this wil abort the script immediately.

  In addition to scripts that you define, the default npm `outdated`, `update`, and `install` scripts are also available to run.

* **FIX** for issue #564. VSCode edit link would not work if the uibuilder root folder did not start with a `/`. Also, the VSCode edit link could not be amended.

* **FIX** for duplicate url error when node is used in a subflow. [Ref](https://discourse.nodered.org/t/uibuilder-url-inconsistancies-and-issues/98853).

* **FIX** for issue #556. The library list in the Editor config panel would not work correctly if a library name contained special characters. Thanks to Paul Reed for reporting this issue.

#### Ui class

* **Fixed** a hidden issue with `replaceSlot()`. The safe method of creating a DocumentFragment does not work if the parent element is a `<template>`. For that, you can only use `innerHTML`.

* **NEW** showOverlay function. This function creates and displays an overlay window with customizable content and behavior. See the uibuilder client documentation for more details.

### uib-sender node

* **BUG FIX** It was not returning messages from the front-end. This was a regression bug from a previous update. Many thanks to [@Robert0](https://discourse.nodered.org/t/uibuilder-sender-node-no-response/98553) for reporting.

### `uib-brand.css` front-end styles

* Improved colour contrast for default text/background.
* Improved background contrast for forms. Forms now stand out if emmbedded in an `<article>` element.
* Corrected the foreground/background colour for inputs and textareas. Now works better in light mode.
* Improved appearance of inputs and select elements outside of forms.
* Updated the table header styles to make them sticky. This means that the table headers will remain visible when scrolling down a long table. This is particularly useful for large tables with many rows.
* Changed `accent-color` to use the `--primary` variable rather than the `--brand` variable. `accent-color` is used by browsers to set the colour of form elements such as checkboxes and radio buttons. This means that the colour will now match the primary colour used in the rest of the uibuilder styles.
* Added `cursor: pointer;` to the `<summary>` element. This makes it clearer that the element is clickable and can be expanded or collapsed.
* Improved `.status-side-panel` styles. Allowing background color to be overridden with `--status-color`.

For forms, the following CSS variables (show with their defaults) can be used to more easily change the appearance of the forms:

```css
/* The main background color for form elements */
--form-bg: var(--surface1);
/* The main text color for form elements */
--form-fg: var(--text2);
/* The border color for form elements */
--form-border: 1px solid var(--text3);
```

For the updated navigation menus, the following CSS variables (show with their defaults) can be used to more easily change the appearance of the menus:

```css
/* The main background color for the menu */
--nav-bg: var(--surface3);
/* The main text color for the menu */
--nav-fg: var(--text2);
/* Secondary background color - used when hovering over other menu items */
--nav-2nd-bg: var(--primary-bg);
/* More contrasting text color - used for selected menu items */
--nav-2nd-fg: var(--text1);
/* More contrasting background color - Used for menu pop-up background */
--nav-3rd-bg: var(--surface2);
```

### uibuilder client library

* **NEW** function `uibuilder.reactive(srcvar)`

  This function allows you to create a reactive variable. It outputs a custom event when the variable changes (including deep object changes). It returns the reactive version of the variable. This also has several new methods:
  * `onChange(property, callback)`: Adds a listener that triggers the callback when the specified property of the reactive variable changes. If `'*'` is specified, it listens for any change to the variable. It returns a reference to the callback that can be used to remove the listener later. The reference also has a `cancel()` method
  * `cancelChange(callbackRef)`: Removes a listener using a saved callback reference.
  
  > [!WARNING]
  > If the reactive variable is a *primative* type (string, number, boolean), then the you MUST use the `myvar.value = 42` syntax to change the value. If you use `myvar = 42`, then the reactive variable will overwritten. The `value` property will also let you change a primative even if it has been created with `const`.

* **NEW** `showOverlay` function. This function creates and displays an overlay window with customizable content and behavior. This is an easy way to display some temporary information to the user.

  Also available as an external (from Node-RED) command. In that case, `msg.payload` is used as the content of the overlay unless `options.content` is specified. Controlling options can be passed in the `msg._uib.options` property

* Updated the client library type description files. They are available in the `types` folder of the `blank` template. There is a `tsconfig.json` file in the root of that template that includes the type definitions. This means that you can now get better code completion, descriptions and type checking when using the client library in your own code. Feel free to copy the file and the folder to your own projects.

  > [!WARNING]
  > The type definitions are not automatically updated when the client library is updated. You will need to update them manually by copying the files from UIBUILDER's `templates/blank/src/front-end-module` folder.

* Updated the `showDialog` function:

  * Allow more flexible use. Any of the parameters can now be `null` and the function will use sensible defaults. That lets you simple call `uibuilder.showDialog(null, null, msg)` to get a notification that overlays the rest of the page and can be dismissed simply by clicking anywhere on the page. Note that the actual definition of the function resides in the `ui.js` source module.
  * Allow any keypress or touch to dismiss the dialog.

* UI library source file renamed from `ui.js` to `ui.mjs`. This is to make it clearer that it is an ES module. The file is still compiled into the client library as before. The gulp build process has been updated to reflect this change and simplified in line with the main client module build.

* **UPDATED** Full uibuilder intellisense is now available for VS Code users when editing front-end JavaScript. Update your JS files to include `/// <reference path="../types/uibuilder.d.ts" />` at the start of your code. Don't forget to update the `types` folder with updated type definitions after upgrading uibuilder. You may need to manually create the `types` folder if using templates from previous versions.

* **UPDATED** The feature that allows external commands to be sent from Node-RED has been improved. It now supports additional options for customizing the command behavior. Currently only used by the new `showOverlay` command.

* **FIXED** `uibuilder.formatNumber(...)` - fixed handling of decimal places. Previously 0 dp was not working.

### uibRouter SPA client library

* Added functions to auto-generate a menu of routes. Driven by updated router configuration data. Example:

  ```js
  {
    defaultRoute: 'route01',
    routes: [
        { id: 'theme', src: './fe-routes/theme-editor.html', type: 'url', 
            title: 'Theme Editor', description: 'Theme editor.' },
        { id: 'route01', src: './fe-routes/route01.html', type: 'url', 
            title: 'Home Summary', description: 'A summary view of the home.' },
        { id: 'wanted', src: './fe-routes/wanted.html', type: 'url', 
            title: 'To Do', description: 'My to do list for this site.' },
    ],
    routeMenus: [
        {
            id: 'menu1',
            menuType: 'horizontal',
            label: 'Main Menu',
        },
    ],
  }
  ```

  In this version, only horizontal, single-level menus are supported. In the future, expect to see multi-level and vertical menus. Possibly also tabbed menus. Search forms may also be added.

* **BUG FIX** If you define the route container in the config but it does not exist, we now throw and error and stop. If you haven't defined a container at all, it is auto-created and attached to the body element and a warning issued.

* Significantly improved documentation.

### uibuilder configuration

* Updated the template middleware files that are copied to `<uibRoot>/.config/*.js-template` on each restart. Added links to uibuilder documentation and pointed out the use of the message and security hooks now available via the Node-RED settings.js file.

### Documentation

* **NEW** Quickstart guide completely rewritten. Now has two main approaches: no-code/low-code and low-code/custom code. Each approach has a step-by-step guide to get you started quickly.
* Rearranged the sidebar for additional clarity.
* **NEW** "Reactive UI's" in the client section. This is a new section that describes how to use the reactive attributes in UIBUILDER to create dynamic web pages with minimal code. It includes a summary of the available attributes and how to use them.
* Updated `uib-configuration` documentation to show the latest settings.js options including the msg, client and socket.io hooks. These allow you to enhance or override the `msg._client` data, simulate user authentication, block message send/receive, and redirect unauthenticated users.
* Updated the `security/authenticated-client-properties` documentation. Added a tip about the hooks in the settings.js file.
* **NEW** Added a new "how-to" article describing how to use Node-RED and uibuilder as a live web development server. This is a simple way to get a live reload server without needing to use complex build tools.
* Updated the comparison between uibuilder and Dashboard 2. Emphasising uibuilder's multi-app capabilities and dark mode.
* Significantly improved uibRouter SPA documentation.
* Updated walkthrough to match current templates. (Issue #563).
* **NEW** Rotating "Tips" page added. Updates once per minute from a random selection of tips.
* Main README updated with improved badges. Fixed the documentation badge, added a sponsor badge. A DeepWiki badge also added.
* Comparison with Dashboard 2 updated to reflect current capabilities of both projects.

* Some rework of the Docsify configuration.

  * Added a "Tips" page that rotates through a selection of tips.
  * Added a new tips custom Docsify plugin that allows display of tips from a given source folder. Used on the tips page. Provides rotating, random and specified tips.
  * Removed the auto-restyleing of the word "UIBUILDER" that was using HTML colours. It was causing issues with some themes and was not accessible. I will add a manual `[UIBUILDER]` Markdown extension that can be used when needed.

### **NEW** Experimental front-end client library

* **NEW** `../uibuilder/experimental.mjs` experimental front-end library. Internally loads the live client library and extends it with experimental features. It does require some setup and its features WILL change unexpectedly.

  Note that this library is only available as an ES Module.

* `src/front-end-module/experimental-demo.html` - A simple demo page that shows how to use the experimental features. It is not intended for production use. You will need to copy the html file to a uibuilder instance's `src` folder and then load it in your browser. The demo page will show you how to use the experimental features. It may not always be up to date with the latest experimental features.

The purpose of this is to allow greater experimentation with new features without disturbing the live client library.

### Development changes

* **NEW** file `src\front-end-module\reactive.mjs` - contains the new `Reactive` class that implements the reactive variable functionality. This is a new module that can be used in the front-end client library but can also be used independently. This is provided as source only for now. Though it is compiled into the client library as well and so available via the `uibuilder.getReactiveClass()` and `uibuilder.reactive()` functions.
* uibuilder runtime library files renamed from *.js to *.cjs for clarity. Part of the long-term effort to move eventually to ES Modules.
* More code cleanup using latest ESLINT rules.

## v7.4.3

[Code commits since last release](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.4.2...v7.4.3).

** Bug fix for [Issue #557](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/557) - Building ui.js with ESBUILD was causing the require to fail in the `uib-html` node. Needed to adjust the code from `require('./libs/ui.js')` to `require('./libs/ui.js').default`.

## v7.4.2

[Code commits since last release](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.4.1...v7.4.2).

* Dependabot updates to dependencies.
* Merge PR #553 from mutec: Fixes an issue with the glob function in `libs/fs.cjs`. Only impacts Windows users.
* Fix issue [#546](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/546). Issues with the client ui library's `showDialog` function.
* Update the ui `showDialog` function - improving layout and updating the CSS styles in the `uib-brand.css` file.

## v7.4.1

[Code commits since last release](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.4.0...v7.4.1).

* Dependabot updates to dependencies.
* Correct typo & update release steps in documentation.
* ESLINT and TS minor corrections.
* Remove spurious require from admin-api-v2.

## v7.4.0

[Code commits since last release](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.3.0...v7.4.0).

### 📌 Highlights

### uibuilder client library

* New variable `uibuilder.get('currentTransport')`
  
  Will either be `websocket` or `polling`. This is set when the connection is established and may change if the connection is lost and re-established. Should generally be `websocket` after a few ms. If still set to `polling`, then either there are network issues or there is a poorly configured proxy server in the way. If you are using a proxy server, it should be configured to allow WebSocket connections. Even with `polling`, the connection should still work but it will be slower and less efficient.
  
  A console error message will be logged if the transport is not `websocket` after a few seconds.

* When using the custom HTML attribute `uib-topic`: `msg.dataset` is now processed along with `msg.attributes` and `msg.payload`. `msg.dataset` must be an object, each key becomes a `data-*` attribute on the element.

### `uib-cache` node

* **FIXED** Setting the "# messages" to zero should have retained unlimited messages for each "Cache by" property. It wasn't working correctly. Now fixed. Many thanks to [Manjunath Satyamurthy](https://discourse.nodered.org/u/smanjunath211) in the Node-RED Forum for reporting this issue.

### `uib-brand.css` front-end styles

* Amended `.status-grid` class to use 3 variables: `--status-grid-min`, `--status-grid-max`, and `--status-grid-gap`. This allows the grid to be more flexible and responsive. The default values have not changed but you can now override them in your own CSS.

### Documentation

* Creating UIs:
  * Grid Layouts - Now a more complete article on how to create responsive, content-heavy grid layouts.
  * CSS Best Practice - Some simple guidelines and good practices for creating flexible layouts using CSS.
  * Charts - A new article on how to create charts using the uibuilder client library. This is a work in progress and will be updated as more information becomes available.
  * Form Handling - A new article on how to handle user input using forms and other input elements. This is a work in progress and will be updated as more information becomes available.
  * Creating Web Apps - How to create data-driven web applications using UIBUILDER. Article updated.
  * Several other articles are still awaiting content. Lists, Maps, Tables, Dashboard Layouts, Cards, Articles.

### Node-RED Admin endpoints

* `<nrAdminURL>/uibuilder/uibindex?type=diagnostics` is a new variation on the `uibindex` endpoint. It returns diagnostics information in JSON format that shows uibuilder detailed diagnostic information. You must have an active Node-RED Editor session to be able to access this endpoint.

> [!WARNING]
> Please take care with the use of this endpoint as it contains sensitive information about your uibuilder instances.

### Server library: `admin-api-v2.js`

* **FIX** `/uibindex` route incorrectly assumed the presence of `req.headers.referer`.
* **NEW** `/uibindex?type=diagnostics` added. Returns diagnostics information in JSON format that shows uibuilder detailed diagnostic information. You must have an active Node-RED Editor session to be able to access this endpoint.
* Switched from passing the uib master variable to use the `uibGlobalConfig` module. This is a step towards a more modular codebase.

### Devlopment processes

* Rebuilt the gump build process for the front end client library. Now simplified and more robust.

## [v7.3.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.3.0...v7.2.0)

### 📌 Highlights

* A new documentation section called "Creating Web UI's" has been added. The idea is to provide quick-reference guides on how to create common page elements and layouts using UIBUILDER. Some of the articles that were pare of the "Using UIBUILDER" section have been moved to this new section for clarity. _What else needs to go here? Please let me know in the Node-RED Forum._

* UIBUILDER standard templates can now be external repositories, loaded via Degit. You could already load an arbitrary template this way but now some of the standard templates have been moved so that they can be more easily maintained. The selected template now also shows a description.

  * Several templates have now been removed from core. They are now relegated to a [separate repository](https://github.com/TotallyInformation/deprecated-uibuilder-templates) and will no longer be updated. Of course, you can still copy the code yourself should you need a head-start and want to use them.
  * Most of the remaining templates are now external. They will reside in their own repositories on GitHub and can be maintained separately to UIBUILDER.
  * Templates now include a `tsconfig.json` file and a `/types` folder that describes the uibuilder client library. When writing front-end code, you should now get better code completion, descriptions and type checking.

* The templates now all have an updated `<div id="more" uib-topic="more"></div>` element. While this has been a staple of the templates and examples for a while, the addition of the `uib-topic="more"` attribute means that you can now show the content of a msg.payload without having to write any JavaScript code. Don't forget to set `msg.topic` to `"more"` so that the uibuilder client library knows where to send the message.

Don't forget to try loading the updated templates to see the improvements.

### Documentation

* **NEW** Section: "Creating Web UI's"
  * **NEW** (Draft) Creating a web app - How to create a web app using UIBUILDER
  * **NEW** Grid layouts - Creating a content-heavy grid layout using CSS Grid
  * **NEW** Dashboard layouts - Creating a dashboard-style layout using CSS Grid
  * **NEW** Forms: User input handling - Handling input using forms and other input elements
  * _SOON_ Tables
  * _SOON_ Charts
  * _SOON_ Maps
  * _SOON_ Articles
  * _SOON_ Lists
  * _SOON_ Cards

Please let me know if you want to see other content in this section.

### `uib-brand.css` styles & variables

* Improved default font specifications based on [Modern Font Stacks](https://github.com/system-fonts/modern-font-stacks).

### uibuilder client library

* TypeScript definition files now included. This gives a much better experience when using the client library. It works for JavaScript not just TypeScript. All of the templates now also contain copies.

### Runtime Plugin

* **FIX** Error in `RED.util.uib.dp` that always returned a single decimal place if zero dp's were requested.
* **NEW** `RED.util.uib.truthy(val)` - Returns true if the value is truthy. This is useful for checking if a value is set or not. See the details in the documentation.

### Node: `uibuilder`

* Updated template processing to allow standard templates to be external.
* Templates now show a description in the Editor config.
* Removed templates: `esm-blank-client`, `esm-vue3-nobuild`, `iife-blank-client`, `iife-vue3-nobuild`, `svelte-basic`, `vue2-bootstrap`,`vue2-simple`. Reference copies placed in the [deprecated templates repository](https://github.com/TotallyInformation/deprecated-uibuilder-templates).
* External templates added: "Extended IIFE example", "Simple external ES module", "External Svelte", "Vie3 no build step, IIFE client". Each with a link to the corresponding GitHub repository.
* **FIXED** The `uibuilder` node's "Node details" button now correctly opens the instance settings page in the Node-RED Editor. It was previously trying to open a non-existent page.
* **FIXED** The `uibuilder` node's "Node details" button now correctly opens the instance details page.

### Background code improvements

* Moved the uibuilder node's `uib` var to `nodes/libs/uibGlobalConfig.cjs` as a module. Enables being able to require it rather than pass it in libs and other nodes. Another step towards a more modular codebase.
* Started renaming js files to better indicate whether they use script/CommonJS (`*.cjs`), or ESM (`*.mjs`). Mostly to help with ESLINT.
* Lots of code cleanup and linting to make the code more readable and maintainable.

## [v7.2.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.2.0...v7.1.0)

### 📌 Highlights

* **NEW NODE** `uib-sidebar` - Creates a simple sidebar in the Node-RED Editor page. HTML for the sidebar is edited in the node. Messages sent to the node are passed to the sidebar letting you change any attributes and inner HTML or text dynamically. Any input elements in the HTML automatically send changes back to the output of the node. A new example flow is available that demonstrates useage.

* Updated `applyTemplate` function in the ui/uibuilder client libraries, gives a lot more flexibility.

* Input form improvements.

  * `uib-element`'s form type now adds an HTML ID to the form itself in the format `form-<element-id>`. This means that using a button inside a form, the resulting message will identify the form that the button belongs to. This is particularly useful if you have multiple forms on a page.
  * When using the `eventSend` function (which is also used by `uib-element`), file input types now add more meta-data to the returned file-upload message. See the details below. Making it easier to process the file upload and combine with other data from a form.

* Bug fixes

  * uibuilder no longer overrides Node-RED's built-in ExpressJS server settings in regards to JSON upload sizing.

### **NEW** Node: `uib-sidebar`

Creates a simple sidebar in the Node-RED Editor page. HTML for the sidebar is edited in the node.

Messages sent to the node are passed to the sidebar allowing you to change any attributes and inner HTML or text dynamically.

Any input HTML elements automatically send changes back to the output of the node (in the future, wrapping inputs in a form element will allow sending only on button press but this isn't yet implemented).

This is the first release of this node and further improvements will be added in the future. Check the "next" and "roadmap" documents for future plans.

A new example flow has been added to demonstrate the sidebar node.

### Node: `uib-element`

* The form element type:

  * Now adds an HTML ID to the form itself in the format `form-<element-id>`. This means that using a button inside a form, the resulting message will identify the form that the button belongs to. This is particularly useful if you have multiple forms on a page.
  * Adds the onclick event handler to the button onclick attribute rather than it being hidden away in separate event handler code. This means that *it will be retained if saving the resulting HTML*. Similarly, the reset button is now type="reset" for the same reason.

### **NEW/UPDATED BUILT-IN WEB COMPONENTS** (AKA "Widgets")

These are pre-built into the uibuilder client library and can be used in your HTML without the need for writing JavaScript.

* All of the components built into the uibuilder client library have been updated to match the latest standards used in my [independent web components](https://wc.totallyinformation.net/) as these represent the latest HTML standards and best practices.

* `<apply-template>` - Takes the content of a `<template>` HTML tag and appends that content as children of itself. Allowing you to re-use standard, repeatable HTML without the need for JavaScript coding and without the need of sending potentially lengthy HTML from Node-RED every time it is needed. Any existing content between the `<apply-template>` tags is replaced. However, if the template has a slot, the existing content is placed back into the slot. This allows you to wrap existing content with a template.

* `<uib-meta>` - Display's facts about the current page such as its file size, when it was created and when it was last updated. Obtains the data from Node-RED. The `type` attribute updated for ease of use.

* `<uib-var>` - A web component that can be used to display dynamic content. It can be used to display simple text, HTML, lists, tables, and more. It can also be used to send data back to Node-RED.

### **NEW** Front-end library: `tinyDom.js`

When used with UIBUILDER, exposes a new global object `dom`. Enables easy changes to your uibuilder-enhanced web pages by providing easy functions to add to, remove or update the existing page.

Also includes a new message schema that allows you to send messages from Node-RED to the client to update the DOM. This is a much simplified low-code feature.

See the [documentation](client-docs/fns/dom.md) for more information.

### Front-end library: `uibuilder.js`

* Form handling: File input types now add more meta-data to the returned file-upload message.

  * A `seq` number and a `seqCount` for multi-file submissions.
  * `id` is the HTML id of the source input element.
  * `formId` is the HTML id of the form that the input element belongs to. The `formId` won't exist if the input was submitted without a form.
  * `tempUrl`. This is probably the easiest property to use if you need to merge data with the main message since it will always be unique.
  * `clientId`, `pageName` and `tabId`. This is duplicate data if you've turned on the `_uib` property in your uibuilder node but it should make it easier to filter/switch messages in your flows.
  * `data` object. This contains any data-* attributes from the input element. Making it easier to attach additional information when uploading the file. You could use an `onchange` event on another input that updates a data-* attribute on the file input element.

* **Updated functions**
  * `eventSend` - Improved handling of file uploads including additional meta-data as shown above.
  * `uploadFile` - Improved handling of file uploads. Now takes an optional 2nd object parameter of meta-data that will be added to the file-upload message.
  * `applyTemplate`, `$`, `$$` - See ui.js section below.

### Front-end library: `ui.js`

NB: Updates to this, also update the main uibuilder client library.

* **UPDATED FUNCTIONS**

  * `applyTemplate` - Now has 3 modes of operation. `insert` appends the template as the 1ST CHILD of the target. `replace` replaces all of the child content of the target. `wrap` puts the targets previous content into the 1ST SLOT of the template (if present), this allows you to wrap existing content with a template. Also improved error handling and did some code cleanup.
  * `$` - Now has an optional 3rd parameter to allow specifying the search root context. Defaults to `document` which was previously the only option. If used, must be a valid HTML element. Brings it further into line with similar functions in other libraries.
  * `$$` - Now has an optional 2nd parameter to allow specifying the search root context. Defaults to `document` which was previously the only option. If used, must be a valid HTML element. Brings it further into line with similar functions in other libraries.

### Server library: `web.js`

* **Bug fix** Moved JSON and URL Encoded data upload middleware from being loaded for both custom and Node-RED ExpressJS servers to only being loaded for the custom server. [Ref.](https://discourse.nodered.org/t/json-payloads-larger-than-100kb-are-refused-when-using-ui-builder/95988) This was blocking people from uploading large JSON payloads when using Node-RED's built-in ExpressJS server.

### Documentation

* **NEW HOW-TO** - Form handling - How to handle user input in forms. This includes a full example of how to use the new `uib-element` node to create a form and send the data back to Node-RED as well as using individual input elements.
* **NEW HOW-TO** - Send file to server - How to send a file to the Node-RED server using an HTML input element. This is useful for uploading files from a client to the server.
* Updated the documentation of the `eventSend` FE function.
* Updated the documentation for the `$` FE function.
* Updated the documentation for the `$$` FE function.
* Updated the documentation of the `uploadFile` FE function.
* Updated the documentation of the `applyTemplate` FE function.
* Updated the documentation for the new `uib-sidebar` node.
* Docsify configuration updated so that the description for the currently shown page is reflected in the browser's meta description tag. This should help with search engine optimisation and when pasting a link from the GitHub version of the documentation into social media.

### Other changes

* Runtime log messages now all start with `🌐` to help them stand out from other log entries. All log output should then have `[....]` after the icon but before the information and data. The content of the braces being `uibuilder:` followed by additional information of what code module/function generated the log entry.
* Runtime warning log messages now all start with `🌐⚠️` to help them stand out from other log entries.
* Runtime error log messages now all start with `🌐🛑` to help them stand out from other log entries.
* Much previously deprecated code has been removed.
* Code linting has move from ESLINT v6 to v9. This was horrid work! And resulted in me raising 2 bugs with the ESLINT team. The new version of ESLINT is much more strict and has found a number of issues that were previously missed. This should result in better code quality.

### Experimental

These are future features being worked on but not yet ready for use.

* `dom`/`tinyDom` - This is both a client-side new feature and a new message schema that facilitates data-driven DOM updates (e.g. web page updates) from both Node-RED and client code. It is a much simplified low-code feature. With it, you can easily create new content and update existing content on your web pages. It does, however, require some familiarity with HTML.

* `logger` - A next-gen client-side logging library.


## [v7.1.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.1.0...v7.0.4)

### 📌 Highlights

* **Any** *Node-RED custom node* can now send a message to a uibuilder client! In your runtime code, add `RED.events.emit('uibuilder/send/<url-name>', {payload: 'Hi from my custom node!'})` where `<url-name>` is the URL set in a deployed uibuilder node. The data will be sent to all browser tabs connected to that uibuilder endpoint. Note though that this bypasses any uib-cache node.

* You can now send a message from Node-RED to a connected client from a Function Node! Simply add `RED.util.uib.send('uibname', {....})` to your function code. This will send a message to all connected clients for that uibuilder instance.

* For front-end coders, you now have access to a number of table manipulation functions. Making it very easy to create and manipulate tables in your web pages from simple input data. You can add and remove tables, table rows and add event handlers (e.g. click) to rows or cells.

### General changes

* Added ability to send messages from Node-RED to a connected client from a Function Node. Simply add `RED.util.uib.send('uibname', {....})` to your function code. This will send a message to all connected clients for that uibuilder instance.

* References to `fs-extra` 3rd-party library removed from all nodes & libraries except `libs/fs.js`.

* [Socket](https://docs.socket.dev/docs/socket-for-github) security check tool added to all TotallyInformation GitHub repositories including UIBUILDER. Provides significant supply-chain security and privacy checks.

* All references to node.js's `fs` library now restricted to `libs/fs.js`.

* To help further improve the development of the brand css, [LightningCSS](https://lightningcss.com/) is now used to compile the source CSS. This ensures that the CSS is not using too new CSS options and improves the performance of the CSS. Additionally, stylelint is now used to check the CSS for errors and warnings.
* Now using LightningCSS to compile source CSS and ensure not using too new CSS options.

* Some unused NodeJS files have been removed.

* `@totallyinformation/ti-common-event-handler` dependency package now removed completely. `RED.events` is used throughout, all uibuilder events start with `UIBUILDER/`.

* To make it easier to create new elements in the future. Moved no-code element runtime processing to a common folder, `nodes/elements`. Added Editor API's and moved processing out of the `uib-element` runtime to separate module. Also moved element description and advanced options HTML to `nodes/elements/en-US`.

* The common code and css files in the `resources` folder (`ti-common.js` and `ti-common.css`) have been renamed to `editor-common.js` and `editor-common.css` respectively. This is to make it clearer that these are used in the Node-RED editor only.

* The `uib-plugin` library now renamed to `uib-editor-plugin` for clarity.

* New `uib-runtime-plugin` library added. Now manages most of the additions to `RED.util.uib` which contains functions made available to Node-RED function nodes.

* 1st phase of standardising event id's. All now start with `uibuilder/`.

* 1st phase of standardising log outputs. All will eventually start with `🌐` to help them stand out from other log entries.

### `uib-brand.css` styles & variables

* **NEW** Utility classes
  * `square` - Make something square or rectangular.
  * `round` - Make something circular, oval or pill-shaped
  
    Each of these are controlled by simple CSS variable overrides. See the [live file](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/main/front-end/uib-brand.css) for details on use.

* Core font now changed to match the uib-brand.css. No more Google fonts! This should make the UI more consistent and faster to load.
* Now using LightningCSS to compile source CSS and ensure not using too new CSS options.
* Added `text-wrap: balance` to `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `heading` and added `text-wrap: pretty` to `p`, `li`, `figcaption` - these make the elements look a little nicer when text is wrapping.
* Added `container-type: inline-size` to `header`, `footer`, `main`, `section`, `article`. This is in preparation for the future use of [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) which are a much more flexible alternative to [Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries) for controlling responsive layout breakpoints. Container Queries are still very new and not yet supported widely enough to use.
* Added some additional "reset" tweaks for improved visual style.

### Node: `uibuilder`

* Node-RED Editor:
  * **FIXED** When a URL is changed, the IDE editor url is now updated automatically. This is particularly important when copying/pasting a uibuilder node.

#### Front-end code templates

* Removed optional link to legacy CSS style library.

### Front-end library: `uibuilder.js`

* **NEW FUNCTIONS**

  * `buildHtmlTable` - Returns HTML of a table created from the input data.
  * `createTable` - Uses `buildTable` to create a new table and attaches to a parent element in the DOM.
  * `tblAddRow` - adds a new row to an existing table.
  * `tblRemoveRow` - removes a row from an existing table.
  * `tblAddListener` - adds row/cell listeners to the 1st tbody of a table. Will send a msg back to Node-RED when used with uibuilder.

* **Updated the front-end `index.html` templates to highlight that the uibuilder client library MUST be included.** After seeing several people take it out.

* Added `uibuilder:propertyChanged:${prop}` custom event when a managed variable changed. Has the same event.details as the 'uibuilder:propertyChanged' event. This event can be used instead of the `uibuilder.onChange('prop', ....)` function if preferred.

* Updated `uibuilder:propertyChanged` and `uibuilder:propertyChanged:${prop}` custom events to include `oldValue` as one of the event details. Will be `undefined` if the property is new.

* Updated `uibuilder.eventSend` function to include `msg._ui.dataset` which contains any `data-*` attributes from the element that triggered the event.

### Front-end library: `ui.js`

* **NEW METHODS**
  * `buildHtmlTable` - Returns HTML of a table created from the input data.
  * `createTable` - Uses `buildTable` to create a new table and attaches to a parent element in the DOM.
  * `tblAddDataRow` - adds a new row to an existing table.
  * `tblRemoveRow` - removes a row from an existing table.
  * `tblAddListener` - adds row/cell listeners to the 1st tbody of a table. Will send a msg back to Node-RED when used with uibuilder. Defaults to adding a `click` listener.
  * `tblGetCellName` - Returns a standardised table cell name. Either from a `data-col-name` attribute or a numeric reference like `C003`.
* Added `data-col-reference` attribute to created tables - on the `thead` row that actually defines the columns. Making it easier to get a reliable column reference later.

### Front-end components: `uib-var`

* Re-engineered to match the latest standards in the [TotallyInformation web-components library](https://wc.totallyinformation.net).
* Added `ready` event
* Removed shadow dom
* Error messages improved
* Add `source` prop when reporting change back to Node-RED

### Documentation changes

* Improved documentation for uibuilder's event handling and better linked that to how to create custom nodes that work with uibuilder.
* Improved documentation of the uibuilder extensions for the `RED.util.uib` object for use in Function nodes.
* Documentation for the new table handing functions in the client library.

### Example flow updates

* All examples showing the use of the old `uibuilderfe` client library have been removed.
* Several of the example flows have been updated to show the latest features.

### Runtime library changes

#### `web.js`

* Improved error checking and reporting in `serveVendorPackages` when mounting installed libraries. [Issue #428](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/428).

## [v7.0.4](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.0.4...v7.0.3)

Bug fix only. Missing originator on messages from clients.

## [v7.0.3](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.0.3...v7.0.2)

Bug fix only. Issue for new UIBUILDER installations that would get the error `[node-red-contrib-uibuilder/uibuilder] TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received an instance of Array (line:393)`.

## [v7.0.2](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.0.2...v7.0.1)

Bug fix only. Minor issue in `nodes/libs/uiblib.js` regarding the new `nanoId` client id creator.

## [v7.0.1](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.0.1...v7.0.0)

Bug fix only. New optional hooks failing if not present in settings.js.

## [v7.0.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.0.0...v6.8.2)

### ⚠️ Potentially Breaking Changes

Note that potentially breaking changes are only introduced in major version releases such as this one. It has been a couple of years now since the last, v6, major version.

Most of these changes will *not* impact most people but you should check through them just in case.

* If using UIBUILDER's custom ExpressJS server feature (instead of the Node-RED built-in one), **URL's are now case sensitive**
  
  This brings them into line not only with W3C guidance but also with the Socket.IO library. It can be turned off in `settings.js` using property `uibuilder.serverOptions['case sensitive routing']` set to false.

  Note that when using Node-RED's internal ExpressJS web engine (the default), URLs are still case-insensitive because that's how core Node-RED has been configured.

* **Minimum node.js now v18** - in line with the release of Node-RED v4, the minimum node.js version has moved from v14 to v18.

  If you need to update your own servers, please remember to do an `npm rebuild` of all node.js packages afterwards.

* **Rewrite of the `uibuilder.eventSend(event)` function** in the client library.
  
  This might have an impact only if you were relying on some of the auto-naming features of form elements since the formula for that has been significantly improved.

  That function has been extensively re-written and should provide significantly better results now.

* **Removal of the uibuilderfe library**
  
  If you are still using this old library in your HTML code, please move to the module based library as it is far more feature rich and has many bugs removed.

* **Removal of the `uib-list` node**
  
  The `uib-element` node does everything that it did and more.

* **Moved socket.io-client from dependencies to dev-dependencies**

  If using the module based client library, you should not be loading the Socket.IO client yourself since it is already built into the client library. If you are still using the old `uibuilderfe` client, you should replace that and remove the socket.io client library from your html files.

* **Removed the *css auto-load* from the client library** 
  
  This automatically loads the `uib-brand.css` if no css is provided at all. Since all of the standard templates include some CSS and have for a long time, this should not impact anyone.

  At least 1 person hit a race condition. [ref](https://discourse.nodered.org/t/uib-brand-css-sometimes-injected/78876). So this is best removed.

* `jsdom` (using in the `uib-html` node) now tracks the latest releases again

  Shouldn't be breaking at all but you might still want to review things since the new versions of `jsdom` are likely to have better available features. We were restricted to jsdom v21 previously as newer versions required node.js v18+.

* `ejs` package removed

  This should not impact anyone. `ejs` is an ExpressJS server-side templating library and what instructions exist (minimal) say that you need to install it manually. A new [How-to: Server-side Rendered Views](docs\how-to\server-side-views) has been created to help understand how to use server-side templating. It is far from complete however.

* Removed Pollyfills from uibuilder editor code - shouldn't impact anyone using a browser from the last 5 years or so.

* A `uibuilder` node cannot be given a URL name of `common` as this would clash with the built-in folder of the same name that holds resources that can be shared with all instances. This was an oversight in previous releases I'm afraid, now fixed.

* The `uibuilder` node, no longer has the "*Show web view of source files (deploy before you can use it)*" option. The supporting external library was also removed. It never looked that good anyway. Please use the new `uib-file-list` node to produce a custom folder/file list and send to your own custom page.

* Not really a breaking change but worth noting - if you use the Svelte template, that has been updated to use the latest versions of Svelte and Rollup. Those are both at least 2 major versions newer. In doing so, I had to replace a dev dependency and make changes to the config and npm scripts.

### 📌 Highlights

* Some tweaks to the documentation should make it a little easier to get started with. The menu and UX has also been tweeked. There are new pages covering easy UI updates, common design patterns, creating well-structured HTML pages, and troubleshooting.

* The new node `uib-file-list` will produce a list of files from a uibuilder instance. It automatically adjusts to the currently served sub-folder and allows filtering. Use this for producing indexes and menus.

* Markdown improvements.
  
  Both the main uibuilder node (via the `ui.js` library) and the `uibrouter` library both accept markdown content (via the external Markdown-IT library) and now they both support *Markdown-IT plugins* so that you can add features such as checkbox lists, GitHub style callouts, Mermaid diagrams and much more. 
  
  There is also a new documentation page dedicated to using Markdown.

  And, the no-code example flow has been extended to demonstrate how to dynamically load all of the libraries, plugins and even how to set up responses back to Node-RED - for example when a checkbox is clicked.

* Wherever you can use no-/low-code features that accept HTML, you can now include `<script>` tags that will be executed on load.

* Handling of forms and inputs continue to improve.
  
  * Programmatic changes to input values or checked properties now trigger both the `input` and `changed` events - something that HTML normally doesn't do but can be important for data-driven web apps. For example, if using an `<output>` tag to show a combined or calculated input, changes via Node-RED will still update the values.
  * When using the `eventSend(event)` function on inputs whether inside or outside of a form, the returned values have been improved, especially for checkboxes and radio buttons.

* File uploads from client browser to Node-RED are now enabled.
  
  When using a form on a page and using `<input type="file">`, if a file is selected by the client and the file is less than the size of the maximum message size, the file will be automatically uploaded to Node-RED when the form is submitted (assuming you use `uibuilder.eventSend(event)` to submit the form). The upload is a message with file details and the file itself as a buffer in `msg.payload`.

* Security of the UIBUILDER repository on GitHub has been improved.

* On the `uibuilder` node's "Core" tab, the info buttons bar has changed slightly.
  
  The "Docs" button has gone (it is still on the top of panel bar anyway) and been replaced by a new "Apps" button which shows a page *listing ALL uibuilder node instances along with their descriptions where provided*.

  Most of the UIBUILDER nodes have be given a bit of a refresh of their Editor configuration panels. This work is ongoing but should give a more consistent look and feel and make the panels rather more responsive. The layouts are starting to use more modern CSS features. The work isn't complete yet so there are still a few inconsistencies - for example, when you make the panel wider - but we are getting there.

* UIBUILDER now has its own "hooks" feature. For now, these can be used for allowing/blocking or debugging messages. More hooks may be added.

  By adding `uibuilder.hooks(...)` to Node-RED's `settings.js` and adding either of the functions `msgReceived` or `msgSending`, those functions will run when msgs are received from the client or about to be sent to the client respectively. Both functions need a return value of either `true` or `false`. `true` allows the msg through, `false` blocks the msg. You can also use the functions to alter the msg and, of course, to report on it to the Node-RED log. The functions receive `msg` and `node` as the arguments. So you can filter on the node's URL, socket id, client id, page name, etc.

  As well as debugging or msg altering, you can use these to help with message filtering, especially useful as part of authentication and authorisation processes. And somewhat simpler to use than Socket.IO middleware (which is still available).

* Connection headers have been added to the client details that are shown on control messages and on standard messages if the uibuilder "Include msg._uib in standard msg output." advanced flag is turned on. These may be particularly useful if using 3rd-party identity (authentication and authorisation) tooling which may put validated data into custom headings. Note however that these are "connection" headers, ongoing communications between the clients and the server do not update the headers (not possible over websockets) but will be updated if the client reconnects or reloads.

* UIBUILDER now recognises common external user authentications. See [Standardised msg._client properties for authenticated clients](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/security/authenticated-client-properties) in the docs for details. FlowFuse, Cloudflare Access, Keycloak, Authelia and Authentik as well as ones that use standard proxy headers should all be recognised.

* Documentation improvements
  * Access to the documentation inside Node-RED is now available fully offline, no Internet needed.
  * There are lots of new and update pages to explore.

* New example flows: (1) client-side code/Dynamic SVG - A rework of an example from the flows library showing how to overlay interactive lamp icons on an SVG plan backdrop. Turn on/off lights from the web and from Node-RED. (2) Blog/content grid layout. (3) Dashboard grid layout.

* Updated example flows: Various examples have been updated to simplify or improve them, including (1) Simple Flow - index.(html|js|css) can now be populated from a flow that uses uib-save. low-code/report-builder - The required Markdown-IT library is now auto-loaded from the Internet.

* For anyone even vaguely comfortable with HTML or front-end development:
  
  * You can now add a `uib-topic="mytopic"` attribute to _ANY_ HTML element. Doing so makes that element responsive to messages from Node-RED.
    
    For a message with the correct `msg.topic`. The `msg.payload` will replace the inner HTML of the element. `msg.attributes` will update corresponding element attributes. Making this now one of the easiest ways to define dynamic updates in your UI.

  * The built-in `<uib-var>` web component has been updated to be able to directly output HTML _tables_ and _lists_, simply send the appropriate data & set the `type` attribute.
  
  * A new library example has been added to illustrate the different ways to easily update your web pages using this component and the `uib-topic` attribute.

  * New built in *web components* which can be used in your HTML without the need for writing JavaScript
    
    *  `<uib-meta>` Display's facts about the current page such as its file size, when it was created and when it was last updated.
    *  `<apply-template>` Takes the content of a `<template>` HTML tag and appends that content as children of itself. Allowing you to re-use standard, repeatable HTML without the need for JavaScript coding and without the need of sending potentially lengthy HTML from Node-RED every time it is needed.

  * The `$` function now allows a second parameter to change the output. Previously the output would always be the DOM Element. Now you can return the inner text, inner HTML or a list of attributes of the element. e.g. `$('.myelement', 'text')`. Remember though that `$()` returns a DOM element by default so all DOM element API's are available, e.g. `$('#myid').dataset` will return all `data-*` attributes.
  
  * Lots of extensions and improvements to the `uibrouter` front-end routing library in this release:

    * You can now define a set of external html files (that can include scripts and css just like routes) that are immediately loaded to the page. These can be defined in the initial router config when they will be loaded immediately (before routes) or can be manually loaded later. Use these for things like menu's or other fixed parts of the UI.
    
    * You can now define route content as Markdown instead of HTML. This makes Notion/Obsidian-like applications feasible using UIBUILDER.
    
    * You can now use Markdown-IT plugins to enhance your Markdown content.
    
    * You can start with an empty routing list to allow dynamic creation of routes later on.

  * There are many new functions added to the `uibuilder` front-end library. Some are standard utility functions such as fast but accurate number rounding or conversion of primitives into objects. Others simplify the use of the DOM.

  * Console logging level can now be set when loading the uibuilder client library. This allows the startup configuration of the library to be debugged.

* For node developers
  * New events are now available using `RED.events` that track the setup of uibuilder, the setup of each uibuilder node instance and node instance url renames.

  This allows 3rd-party extensions to UIBUILDER to be more easily created. The events pass references to all of the information you might need. [New documentation also now available for contributors](dev/3rd-party-extensions.md) showing the various ways to easily build new content and features through custom nodes and web components.

### "Outdated" dependencies (Resolved)

As of v7, all outdated dependencies have been removed or limited to uibuilder development only, not production use.

The following are only used for _**developing**_ UIBUILDER:

* `execa` - restricted to v5. Author sindresorhus decided that everyone HAS to use ESM even though his packages are widely used and he must know that it is often impossible to move from CommonJS without a complete rewrite. Node-RED is so complex, when would that be possible? Very annoying.
* `@types/node` - restricted to v18 to match Node-RED's current baseline.

### General Changes

* The minimum supported version of Node.JS is now v18.
* Additional security checks added to the public repository. Checks are now locked. OSSF Scorecard checks added. Checks are applied to `main` branch whenever updated.
* stepsecurity.io recommendations applied to the repository.
* Added a `SECURITY.md` policy document.
* Security issues in UIBUILDER can now be reported using GitHub's security advisory service using this link: https://github.com/totallyinformation/node-red-contrib-uibuilder/security/advisories/new
* Moved node definition files for uibuilder, uib-sender and uib-cache into their own sub-folders to match the other nodes. package.json and gulpfile updated accordingly. Also `locale/en-US` sub-folders created in readiness for moving help html. Some help files already moved.
* Removed all `> [!ATTENTION]` callouts from the documentation as it is not used in GitHub.
* The `socket.io-client` package is no longer a dependency. It is now only a dev-dependency thanks to the removal of the `uibuilderfe` client library. The current client library versions have it pre-built.
* The `nanoid` package is no longer a dependency. UIBUILDER now has its own UUID generator function. The nanoid package stopped being useful since it moved to only an ESM release.
* The `jsdom` package now tracks the current release again thanks to UIBUILDER moving to a node.js baseline in line with Node-RED v4 (Node.js v18)
* External module `execa` no longer a dependency.
* On the Detailed Information Page (uibindex) "User-Facing Routes" is changed to "Client-Facing Routes" to make it clearer.
* The Node-RED Editor utility resources `ti-common.css` and `ti-common.js` are now loaded only once using a new utility plugin. Previously they were loaded multiple times by each node.
* New example flows: client-side code/Dynamic SVG - A rework of an example from the flows library showing how to overlay interactive lamp icons on an SVG plan backdrop. Turn on/off lights from the web and from Node-RED.
* Updated example flows: Simple Flow - index.(html|js|css) can now be populated from a flow that uses uib-save. low-code/report-builder - The required Markdown-IT library is now auto-loaded from the Internet.
* For nodes that link direct to a uibuilder instance (`uib-save`, `uib-file-list`, `uib-sender`), changed the default label to 'choose uibuilder node' to better indicate what needs to be done before re-deployment.

* Documentation
  * **Now available fully offline** in Node-RED. Library code also now bundled for improved performance.
  * New How-To: Creating a well-structured HTML page.
  * New page: Easy UI updates - explaining the different ways you can easily and dynamically update content.
  * New page: Common design patterns - the most common ways of working with Node-RED and UIBUILDER.
  * New page: Troubleshooting - some thoughts on issues that might happen, how to spot them and fix them.
  * New page: Comparision between UIBUILDER and Dashboard 2.
  * Mustache plugin removed from Docksify load. Not used and not required since Docsify supports easy loading of custom Vue components which can do the same work.
  * Additional uibuilder web path added `./docs/resources` which is mapped to the `/front-end` package folder. Allowing the docs to use the images, router, branding, etc in the future.
  * The Docsify JS and CSS now split from the main html file for ease of management.
  * Tweaks to Docsify layout and UX for improved readability. A Table of Contents sidebar added that lists h2/h3 headings. The menu is simplified and only shows h1 entries.
  * Lots of minor updates and standardisation.

* URL's are now _case sensitive_ when using the custom ExpressJS server feature. 
  
  This can be [turned off in `settings.js`](uib-configuration#settingsjs) using property `uibuilder.serverOptions['case sensitive routing']` set to `false`.
  
  Socket.IO is already case sensitive but ExpressJS is not. This can cause issues as shown in [Ref](https://discourse.nodered.org/t/uibuilder-and-url-case-sensitivity/81019/6).

  [Ref 1](https://stackoverflow.com/questions/21216523/nodejs-express-case-sensitive-urls), [Ref 2](http://expressjs.com/en/api.html). [Ref 3](https://discourse.nodered.org/t/uibuilder-and-url-case-sensitivity/81019/6).

* Node-RED's admin optional auth token is now added to all admin API calls. [Ref](https://github.com/victronenergy/node-red-contrib-victron/blob/ac5e383b727a13d7f613cb02c183f5b205408c1b/src/nodes/victron-nodes.html#L233-L238). This should ensure that, if you are using tokens in your Node-RED authentication, all the UIBUILDER admin API calls should work consistently.


### NEW node - `uib-file-list`

Returns a list of files with their folders from the active source folder of the chosen uibuilder instance. The searches are constrained to that folder or below and may not escape for security purposes. In addition, any file or folder name starting with a `.` dot will not be searched. Any files or folders that are links, will be followed.

The optional `folder` setting lets you change the search root to a sub-folder. This does not allow a wildcard.

The `filter` and `exclude` settings use simple or advanced search specifications from the [fast-glob](https://www.npmjs.com/package/fast-glob) library.

The `URL Output?` setting will change the output from a folder/file list to a relative URL list (with all entries prefixed with `./` and any `index.html` file names hidden - this allows you to use them in an index or menu listing in the browser).

> [!TIP]
> 
> Use with the front-end router library. Use this node to dynamically create a navigation menu or sidebar index for example.

### uibuilder front-end library

* The `$` function now allows a second parameter to change the output. Previously the output would always be the DOM Element. Now you can return the inner text, inner HTML or a list of attributes of the element. e.g. `$('.myelement', 'text')`

* **BUG FIX** - `uib-topic` attribute processing was not working for routes added with `uib-router`. Now fixed.

* **NEW FEATURE** - The library now actively monitors for `uib-topic` or `data-uib-topic` attributes on **ANY** HTML tag. Where present, a message listener is set up. Messages from Node-RED that match the topic will have their `msg.payload` inserted as the content of the tag (replacing any previous content) and any `msg.attributes` (key/value object) will add/replace attributes on the tag.
  
  Note however, that this uses the native HTML Mutation Observer API, when used on very large, complex pages and on a limited performance client device, this might occassionally cause performance issues. Therefore it will be made optional (but on by default as the code is quite efficient and should be unnoticeable in most cases).

  Use this feature as an alternative to using the `<uib-var>` custom web component.

* **NEW FEATURE** - You can now set the library's `logLevel` using an attribute on the script link itself. This lets you see what is happening in the library much earlier than previously possible. Particularly useful for debugging library config and startup.
  
  For the IIFE library: `<script defer src="../uibuilder/uibuilder.iife.min.js" logLevel="2"></script>`
  For the ESM library: `import '../uibuilder/uibuilder.iife.min.js?logLevel=2'`

* **NEW Web Component** - `<uib-meta>` - display's the page's file created/updated timestamps and file size.

* **NEW Web Component** - `<apply-template>` Takes the content of a `<template>` HTML tag and appends that content as children of itself. Allowing you to re-use standard, repeatable HTML without the need for JavaScript coding and without the need of sending potentially lengthy HTML from Node-RED every time it is needed.

* **UPDATED Web Component** - `<uib-var>` now "table" and "list" output types to go with the existing "text", "html" and "markdown" types.

* **NEW FUNCTIONS**

  * `Element.prototype.query(cssSelector)` and `Element.prototype.queryAll(cssSelector)` Similar to `$(cssSelector)` and `$$(cssSelector)` respectively. However, instead of searching the whole document, they search a sub-set of the document within the given element.
  
    For example: `$('#mydiv').queryAll('div')` would return all of the child `div`s of the element with the id `mydiv`. This can be a lot more efficient with very large documents.

  * `Element.prototype.on(event, callback)` is a shortcut for `addEventListener` and is a bit easier to remember. `callback` is a function with a single argument `(event)`.
  
    Inside the callback, `this` refers to the `event.target`. Unlike `addEventListener`, the `on` method does not support additional options. Use with anything that returns an object derived from `Element`, for example `$('#custom-drag').on('wheel', (e) => console.log('wheel', e))`. The `on` alias is also added to the `window` and `document` objects for convenience.

    > [!NOTE]
    > Only available in the browser.
    >
    > Since they are attached to the HTML `Element` class, they cannot be used in `uib-html`.

  * `applyTemplate(sourceId, targetId, onceOnly)` Applies `<template>` tag contents as appended children of the target. Similar to the new `<apply-template>` web component so that you can do the same thing from both JavaScript and HTML.
  * `arrayIntersect(a1, a2)` Returns a new array (which could be empty) of the intersection of the 2 input arrays.
  * `getElementAttributes(el)` Returns an object containing attribute-name/value keypairs (or an empty object).
  * `getElementClasses(el)` Checks for CSS Classes and return as array if found or undefined if not.
  * `getElementCustomProps(el)` Returns an object containing custom element properties/values (or an empty object). Custom element properties are those set using code that are not standard properties.
  * `getFormElementDetails(el)` Returns an object containing the key properties of a form element such as `value` and `checked`.
  * `getFormElementValue(el)` Check for el.value and el.checked. el.checked will also set the value return for ease of use.
  * `getPageMeta()` Asks the server for the created/update timestamps and size (in bytes) of the current page. The result from the server is set into the managed `pageMeta` variable. Also used by the new `<uib-meta>` web component.
  * `hasUibRouter()` Returns true if a uibrouter instance is loaded, otherwise returns false. Note that, because the router will be loaded in a page script, it is not available until AFTER the uibuilder library has loaded and socket.io initialised.
  * `makeMeAnObject(thing, property)` returns a valid JavaScript object if given a null or string as an input. `property` defaults to "payload" so that `uibuilder.makeMeAnObject("mystring")` will output `{payload: "mystring"}`.
  * `returnElementId(el)` Returns the element's existing ID. Or, if not present, attempts to create a page unique id from the name attribute or the attribute type. The last 2 will use a page-unique number to enforce uniqueness.
  * `round(num, dp)` rounds a number to a set number of decimal places using a fast but accurate "commercial" format.
  * `urlJoin()` returns a string that joins all of the arguments with single `/` characters. The result will start with a leading `/` and end without one. If the arguments contain leading/trailing slashes, these are removed.

* Improvements to the `eventSend()` function:
  * It has been extensively rewritten and refactored.
  * Auto-id'ing of form elements has changed slightly.
  * Handling of input values inside and outside of forms should now be a lot more consistent. Previously, these may not have sent their new values on change events & sometimes they didn't pick up a value at all.
  * **File inputs are auto-uploaded to Node-RED in separate messages** (if they aren't too large, change the Socket.IO buffer size in settings.js if needed).
  * Handles radio and checkbox inputs better. Will return both `value` and `checked` properties.
  * Multi-select inputs now always return an array containing the selected options (could be an empty array).
  
* Auto-load of the brand css (when no other CSS was loaded) has been removed. This could occasionally suffer from a race condition.
* **Markdown-IT plugins** can now be used when using Markdown. See the new "Using Markdown" documentation page for details.
* On first connection, Node-RED informs the client of the maximum allowed message size. This can be altered with the `uibuilder.socketOptions.maxHttpBufferSize` property in Node-RED's `settings.js` file.

### `ui` library

* **FIXED** small inconsistency when handling a msg._ui who's top level was an object with a `mode` mode property instead of an array.
* **NEW** Markdown-IT plugins can now be used. See the new "Using Markdown" documentation page for details.

* Improved Markdown handling.
  
  Should now be more efficient. Also HighlightJS code highlights should be better: Some unnecessary whitespace removed, code brought into line with the latest releases of the HighlightJS library, language guessing now only used if the language is not provided.

* Slot HTML content can now contain `<script>` tags that will be executed on load.

* Programmatic changes to input values or checked properties now trigger both `input` and `changed` events. By default, the DOM will not trigger events except for actual user input. This makes it easy to use `<output>` tags for example that automatically update when inputs change.

* The `$` function now allows a second parameter to change the output. Previously the output would always be the DOM Element. Now you can return the inner text, inner HTML or a list of attributes of the element. e.g. `$('.myelement', 'text')`.

### `uibrouter` front-end library

> Notes:
>
> 1. While it has various uibuilder integrations and is only currently published with UIBUILDER, the router library is not dependent on uibuilder and could be used separately if you like. Might be especially useful for Dashboard or http-in/-out flows.
> 2. To remote-control the current route from Node-RED, use uibuilder's `navigate` command: `msg._uib = {"command":"navigate","prop":"#route07"}`.

* **FIXED** Default route was always being set on load. Now correctly takes the current URL hash into account first.
* **FIXED** Routes loaded via script, if pre-selected on page load (e.g. in URL hash), were crashing. Now will automatically revert to the default route and just print an error to the console.

* **NEW** Router config property `otherLoad` and router function `loadOther` added. These let you load other external HTML template files on startup or manually (respectively). Used for external menu definitions and other fixed parts of the UI.
* **NEW** *External route content can now be Markdown instead of HTML*. The router route config property `format` has been added. By default the content for route templates is HTML, this property lets you optionally define template content as Markdown. In that case, if you have the *Markdown-IT* library pre-loaded, the Markdown template will be rendered as HTML automatically. This allows you to define route content using Markdown instead of writing HTML. If the *HighlightJS* library and CSS is also pre-loaded, code blocks will be nicely rendered.
* **NEW** If using uibuilder, added a new uibuilder managed variable `uibrouterinstance` which has a reference to the router instance. Will alow the uibuilder client library to auto-update things & will allow easier remote control from Node-RED.
* **NEW** Markdown-IT plugins can now be used if using Markdown. See the new "Using Markdown" documentation page for details.

* Refactored some of the router methods, now exposing:
  * `loadRoute(routeId, routeParentEl)` - Loads template content to the page. Will load an external template if not already loaded. Calls `ensureTemplate`. Async, throws errors.
  * `ensureTemplate(routeId)` - Ensures that a specific template has been loaded. Will attempt to load an external template. Async, throws errors.

* `loadRoute` method now has optional 2nd argument, `routeParentEl`, a reference to an HTML parent element. The route template will be added to this as a new child. If not provided, the master content container is used (which has already been defined and created at router startup). This allows specific routes to be loaded to a different parent, useful for having things like menu's defined as routes or for loading routes as sidebars, etc.

* Now enforces only 1 instance of a router on page (would need to change how uib vars work otherwise).
* Internally, a tracking flag is added to inbound messages from Node-RED to indicate if/where they have been processed by the library. This helps to avoid double-processing. This is important now that there are ever more auto-process features available.

### **REMOVED** `uibuilderfe` old front-end library

**REMOVED** - this was deprecated in UIBUILDER v5, it has now been removed completely. Please use `uibuilder.iife.min.js` (for simple `<script>` loading) or `uibuilder.esm.min.js` for ESM module imports.

The `old-blank-client` template and all associated documentation has also been removed.

### `uib-brand.css` styles & variables

* **NEW** Variables
  * `--max-width` added & set to `64rem`. This is used in the above resets.

* **NEW** Styles
  * `::file-selector-button` added to the list of formatted buttons.
  * `header`, `footer`, and `section` given same basic reset as `main`. So they all have max width and are centered in window. However, the formatting is now restricted only to where they are direct children of `body`.
  * `article > h1::before` Adds a warning not to use H1 tags in articles - only a single H1 tag should be used on a web page. Use H2, 3, or 4.
  * `td hr` reduced margin for when you want to use an hr inside a table cell (mostly markdown).
  * `td br` & `th br` increased top margin/line height. Mostly for Markdown tables where using paras might be difficult.

* Amended Styles
  * `body` has been given a slightly darker/lighter background. `--surface1` instead of `--surface2` to improve general contrast slightly.
  * `body > main` is now defined as a grid.
  * `main > article` and `main .left` are set to grid column 1. `main > aside` and `main .right` are set to grid column 2.
  * `article` given a border with rounded corners and same max-width as above.
    
    It is also given the `--surface3` background colour instead of the default `--surface2`. `h2`-`h4` immediately inside the article have reduced margins and a bottom border. This lets you use `article` as a "card" style visual. `div > article` gets additional left/right margins, same as `div > p` - allows for indented nesting/grouping.
    
  * Block elements (h2-4, div, p) inside a summary element are now rendered as inline-blocks. Because a summary already creates a block and you usually don't want the other tags to also create nested blocks.
  * Input, button, textarea and select tags given a minimum width of 2em to allow for more flexible form layouts.
  * Minor tweaks to forms for better vertical alignment for check and radio input labels. Also include `form fieldset` and `form output` along with inputs.
  * `*:focus` & `*:focus-visible` given `--secondary-fg` colour variable `:focus` is used as a fallback if `:focus-visible` not supported by the browser.
  * Major improvements to the `nav` menus. Especially `nav.horizontal`.
    
    `nav` menus now use `flex` for layouts.
    
    Horizontal menus now have the option of including a form for things like search boxes. They also collapse to vertical on screens smaller than 600px wide.

### Example Flows

* **NEW** - Dynamic SVG - A rework of an example from the flows library showing how to overlay interactive lamp icons on an SVG plan backdrop. Turn on/off lights from the web and from Node-RED.
* **NEW** - Content-grid (blog-style) layout example.
* **NEW** - Dashboard-grid layout example.
* `no-code-examples` - Updated to include dynamic script and css in the HTML passthrough example.

### `uibuilder` node

* **NEW** Previously, a link and button to edit front-end code using VScode would be shown if running on localhost. This has now been changed. There is a field on the Advanced tab that lets you set any URL for any IDE or Code Editor that supports them. In addition, as well as for localhost, uibuilder will try to give a reasonable guess for a remote VSCode edit session. Though there is a good chance you will need to set this up in VScode and adjust the link accordingly.

  Using a full code editor or IDE with your front-end code is MUCH easier than using uibuilder's built in Monaco (or ACE) web editor and also allows for extensions, better linting and automations.

* If router loaded (`uibuilder.uibrouterinstance` exists), Add routeId to control messages and to `msg._uib` for standard msgs. 
  
  NB: Cant send route id with initial connect msg since router instance is added later. So cache control must happen on route change messages.

* Removed Pollyfills from uibuilder editor code - shouldn't impact anyone using a browser from the last 5 years or so.

* **FIXED** A `uibuilder` node cannot be given a URL name of `common` as this would clash with the built-in folder of the same name that holds resources that can be shared with all instances. This was an oversight in previous releases I'm afraid, now fixed.

* Template settings made clearer. Now more obvious what is part of the template settings.

* The advanced option "Show web view of source files (deploy before you can use it)" has been removed. The supporting external library was also removed. It never looked that good anyway. Please use the `uib-file-list` node to produce a custom folder/file list and send to your own custom page.

* On the "Core" tab, the info buttons bar has changed slightly. The "Docs" button has gone (it is still on the top of panel bar anyway) and been replaced by a new "Apps" button which shows a page listing ALL uibuilder node instances along with their descriptions where provided. Also the "Full details" button has swapped position with the "Node details" button so that the instance-related buttons are on the left and the all-instances buttons are on the right.

* The help panel has been updated to better reflect the current configurations. Also some additional links added.

* The list of installed libraries now has more reliable behaviour for updates. If there are >1 updates waiting, updating 1 library no longer looses the other indicators.

* Connection headers have been added to the client details that are shown on control messages and on standard messages if the uibuilder "Include msg._uib in standard msg output." advanced flag is turned on. These may be particularly useful if using 3rd-party identity (authentication and authorisation) tooling which may put validated data into custom headings. Note however that these are "connection" headers, ongoing communications between the clients and the server do not update the headers (not possible over websockets) but will be updated if the client reconnects or reloads.

* Replaced custom event handlers with `RED.events`. All uibuilder events are prefixed with `node-red-contrib-uibuilder/` to ensure that there are no name clashes with other nodes or Node-RED core.

### `uib-element` node

* Form element enhanced:

  * File input type now sends a separate message containing each selected file as a buffer that can be given directly to the `uib-save` node or to any other node that accepts a file buffer. Includes additional details, file name, size, last updated, and file (mime) type.

* Table element enhanced:
  
  * Added class names to body cells (`r1 c1`, etc) & body rows (`r1`). Note that these class identifiers will get out of step if dynamic updates are made to the table.
  * Added `id` to table `${divId}-table`

* **FIXED** Markdown output was being wrapped in a `<markdown>` tag which should have been a `<div>` tag. Now fixed.

### `uib-save` node

* Message inputs now allow `msg.fname`, `msg.filename` or `msg.fileName` instead of just `msg.fname`. Makes it compatible with file type inputs and the `eventSend` function.

### `uib-list` node

**REMOVED** - this node was deprecated in UIBUILDER v6. It has now been removed. Use the `uib-element` node with one of the list element types.

### `uib-sender` node

* Changed custom event hander to `RED.events`.

### uibuilder templates

* Svelte template - Has been updated to use the latest versions of Svelte and Rollup. Those are both at least 2 major versions newer. In doing so, I had to replace a dev dependency and make changes to the config and npm scripts.

### `libs/socket.js` library

* If a client msg received with a msg._uib property but the `uibuilder` node hasn't requested that they are shown, delete it before sending on to flow.
* Removed serving of the socket.io client library as this is no longer required (client library is pre-built into the uibuilder library).
* Amended `listenFromClientCtrl`, now listens for a control msg `get page meta`, calls `fs.getFileMeta`, sends the output to the FE using the same control msg. Does not output to uibuilder node port #2.
* Connection headers have been added to the client details.

### `libs/uiblib.js` library (uibuilder utilities)

* **NEW FUNCTIONS** `runOsCmd(cmd, args, opts)` & `runOsCmdSync(cmd, args, opts)` - Run an OS Command. Used for running `npm` commands, replaces the external `execa` library.
* `nanoid` external library replaced with internal code based on [`foxid`](https://github.com/luavixen/foxid)
* `replaceTemplate` moved to `libs/fs.js` & fs-extra/cpySync replaced with node:fs/promises/cp

### `libs/fs.js` library (filing system handling)

* **NEW FUNCTION** `getFileMeta` - Returns at least created & updated timestamps and file size.
* `replaceTemplate` moved from `libs/uiblib.js` & fs-extra/cpySync replaced with node:fs/promises/cp
* Added sync and async copy fns

### `libs/package-mgt.js` library

* Replaced `execa` with `uiblib`.`runOsCmd`. `execa` no longer a dependency.
* Extensive re-write of the code, especially startup and install/remove. 2 new fns added, 6 old fns removed.

### `libs/web.js` library

* Removed Socket.IO client server - no longer required now that the old FE client has gone.
* Added new route `./docs/resources` mapped to the `/front-end/` folder to allow use of uib FE images, brand, router, etc in the docs.
* All filing system access moved to `libs/fs.js`

### All nodes Editor common JS/CSS

* All nodes now use the common `resources/ti-common.js` and `resources/ti-common.css` resource files in the Node-RED editor.
* Moved node-specific styling in HTML to the common CSS.
* Standardised styling to make it consistent across nodes.
* Added optional Node-RED auth token to admin API calls.

## Older changes

Older changes can be found in the Archived section of the UIBUILDER documentation.
