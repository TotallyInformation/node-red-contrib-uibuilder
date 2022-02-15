---
title: uibuilder Glossary
description: >
   Terms used in this documentation and their meanings.
created: 2019-05-27 17:13:00
lastUpdated: 2022-02-15 11:17:34
---

| Term         | Meaning                                                      |
| ------------ | ------------------------------------------------------------ |
| `<xxxx>`     | When a word is shown between angle brackets in the uibuilder documentation, it indicates that this is a variable. (unless it is clearly an HTML tag). |
|              |                                                              |
| instance     | In Node-RED, when a node is added to a flow, it is said that this is an instance of a node. Unlike the Node-RED Dashboard, uibuilder can have many instances, each on a separate url.<br>In addtion, Node-RED itself can be run multiple times. Each of these is "an instance of Node-RED". |
| instanceRoot | The root folder for a specific uibuilder instance. It will be at `<uibRoot>/<url>/`. |
| library      | One or more programme files that are utilised by other programs. Often delivered as one or more modules and installed as a _package_. |
| module       | A node.js module contains one or more exported objects. These are then `require`d (for old-style CommonJS modules) or `import`ed for ESM style modules. See the Node.js documentation for details. |
| package      | A collection of scripts, configuration and documentation that is normally installed via the`npm` command.<br>A package is defined by a `package.json` file in the root folder. |
| uibuilder    | Extension package for Node-RED. node-red-contrib-uibuilder. Also shorthand for the node template and any node instances installed. |
| uibRoot      | The root folder that contains all settings and front-end user code for all instances of uibuilder.<br />Default Location:<br />  If projects not in use: `<userDir>/uibuilder/`<br />  If projects in use: `<userDir>/projects/<projectName>/uibuilder/`<br>However, as of *v4*, the uibRoot folder can now be moved to wherever you want it.<br>As of *v5*, this is also where any front-end library packages are installed. Each installed package is added to the web server so that it can be accessed from your web pages. |
| url          | When used in lower-case, refers to the uibuilder node setting of the same name that defines the URI for the instance.<br />e.g. if url = 'test1' and Node-RED is running on the default port on the local device, the full URL of the default page would be `http://localhost:1880/test1/`<br>When written in upper-case, it refers to the W3C URL, e.g. what you will see in your browser's address bar. |
| userDir      | The folder used by Node-RED to store all settings, configuration and flows for a running instance of Node-RED<br />Default location: `<userHome>/.node-red/` |
| userHome     | The operating system folder designated as the "home" folder for the user ID running Node-RED.<br>For Linux, MacOS and in PowerShell on Windows, there is a shortcut for userHome: `~`. |
| vendor       | A 3rd party. In this case, refers to any 3rd-party package installed via `npm`. |

