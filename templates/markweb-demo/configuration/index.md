---
author: Julian Knight (Totally Information)
title: Markweb Configuration
description: How to configure Markweb in the UIBUILDER node and configuration override files.
tags: 
  - uibuilder
  - Node-RED
  - demo
  - configuration
status: Published
created: 2026-04-03 16:33:59
updated: 2026-04-07 16:34:45
---

Markweb has 2 places where configuration can be set:

1. In the UIBUILDER node configuration - this is the most common place to set configuration for a Markweb instance. It allows you to set the source folder, config folder, and other options on a per-instance basis.

2. In the `markweb.config.js` file - this is a global configuration file that can be used to set default values for all Markweb instances. It can also be used to set configuration options that are not available in the UIBUILDER node configuration.

## Node Configuration

When you add a Markweb node to your flow, you can configure it by double-clicking on the node. This will open the node configuration dialog where you can set the following options:

![Markweb node Editor config](./_images/markweb-editor-config.png){style="width:25em;"}

- **URL** (required): The URL path where the Markweb instance will be served. This must be unique across all Markweb _and_ uibuilder instances.

  > [!NOTE]
  > The URL path _can_ contain sub-paths (e.g. `mysites/docs`). However, if it does, you will need to adjust the default page template for the `../uibuilder/` resource paths. Having a single sub-path would become `../uibuilder/` -> `../../uibuilder/`, two sub-paths would become `../../../uibuilder/`, and so on. Similarly, you should change the default favicon path in the global-attributes.json file.

  > [!WARNING]
  > Make sure that the URL path is unique across _**all**_ web endpoints in your Node-RED instance. This includes all `uibuilder` and `markweb` nodes as well as any other custom nodes that create web endpoints. If there is a clash, you will get unpredictable results.

- **Source** (required): The folder where your Markweb source files are stored. This can be an absolute path or a path relative to the Node-RED user directory. The folder _**MUST EXIST**_.

   > [!TIP]
   > You can use the text `[DEMO]` as an alternative to an actual folder path. This will load the demo content that is included with uibuilder. This is a great way to quickly get started with Markweb, see how it works, and how you can use Markdown with it.

  > [!WARNING]
  > Any folders or files starting with `_` or `.` are blocked for security reasons.
  >
  > Any folder not containing an `index.md` file is ignored. This file is used as the landing page for a folder.

- **Configuration Folder** (optional): The folder where Markweb will find the override configuration files. This can be an absolute path or a path relative to the Node-RED user directory. If used, the folder _**MUST EXIST**_. See below for more details on the configuration override files.

- **Name** (optional): A name for the node. Used in the flow Editor. Has no other effect.

## Page navigation

The default Markweb page template includes a sidebar that displays a navigation tree. This tree is generated from the folder structure of the source folder unless you override it with a `sidebar.json` file as shown below.

The tree is ordered alphabetically (ascending) by either the `shortTitle` or `title` frontmatter attribute of the page, or by the folder name if neither of those attributes are set. You can control the order of the pages somewhat by using the `sortPriority` frontmatter attribute. Set it to "high" to have the page appear before pages with no sort priority set, "low" to have it appear after pages with no sort priority set.

If you hover over a link in the navigation tree, a tooltip will appear showing the page description (from the `description` frontmatter attribute) if it is set.

The current page is highlighted in the tree. The collapse state of the tree is saved in your browser's local storage.

The navigation tree will be automatically updated when changes happen on the server.

## Configuration Override Files
Markweb supports configuration override files that can be used to set configuration options on a per-page basis. These are only used if the "Config Folder" option is set in the node configuration. If it is not set, then Markweb will use the default configuration for all pages.

Currently, only a few files are supported. This is likely to be expanded in the future.

> [!TIP]
> In order to get copies of the default configuration files, you need only create the config folder, specify it in the node configuration, and then restart Node-RED. So if you need to reset one of more of the files, simply delete or rename the file(s) and restart Node-RED.
>
> Changes to the configuration override files do _**not**_ cause the current page to reload automatically. You have to manually reload the page.

The following files are currently supported:

1. `page-template.html`
2. `copyright-template.html`
3. `global-attributes.json`
4. `sidebar.json`

### page-template.html
This file can be used to override the default page template that Markweb uses to render pages. It should contain the HTML template that you want to use for your pages.

> [!WARNING]
> As of v7.6.0, little testing has been done with this feature, so use with caution. In particular, note that the `markweb.mjs` script file is heavily dependent on some of the structure of the default template. Best to retain as much of the default structure as possible when creating your own template, and only change the parts that you need to change.
>
> Similarly, the default CSS file currently makes assumptions about the page structure.

### copyright-template.html
This HTML fragment file can be used to override the default page footer.

### global-attributes.json
This file can be used to set global attribute defaults that will be applied to all pages that do not have the attribute(s) explicitly set in the page's front matter.

### sidebar.json
This file can be used to set the content of the navigation tree that is displayed in the left-hand sidebar. It should contain a JSON array of objects that define the structure of the sidebar.

Manually reload the page to see changes. There is no default content for this file, it must be created by the user. The structure of the JSON should be as in this example:

```json
[
    {
        "title": "Home",
        "shortTitle": "Home",
        "description": "Welcome page",
        "path": "/",
        "children": []
    },
    {
        "title": "Getting Started",
        "shortTitle": "Start",
        "description": "How to get started",
        "path": "/getting-started/",
        "children": [
            {
                "title": "Installation",
                "path": "/getting-started/installation"
            },
            {
                "title": "Configuration",
                "path": "/getting-started/configuration"
            }
        ]
    }
]
```
