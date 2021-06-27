---
title: uibuilder Glossary
description: >
   Terms used in this documentation and their meanings.
created: 2019-05-27 17:13:00
lastUpdated: 2021-06-27 17:59:43
---

| Term      | Meaning                                                      |
| --------- | ------------------------------------------------------------ |
| `<xxxx>`  | When a word is shown between angle brackets in the uibuilder documentation, it indicates that this is a variable. (unless it is clearly an HTML tag). |
|           |                                                              |
| instance  | In Node-RED, when a node is added to a flow, it is said that this is an instance of a node. Unlike the Node-RED Dashboard, uibuilder can have many instances, each on a separate url. |
| library   | One or more programme files that are utilised by other programs. Often installed as a _package_. |
| package   | A collection of scripts, configuration and documentation that is normally installed via the`npm` command. |
| uibuilder | Extension package for Node-RED. node-red-contrib-uibuilder. Also shorthand for the node template and any node instances installed. |
| uibRoot   | The root folder that contains all settings and front-end user code for all instances of uibuilder.<br />Default Location:<br />  If projects not in use: `<userDir>/uibuilder/`<br />  If projects in use: `<userDir>/projects/<projectName>/uibuilder/` |
| url       | When used in lower-case, refers to the uibuilder node setting of the same name that defines the URI for the instance.<br />e.g. if url = 'uib' and Node-RED is running on the default port on the local device, the full URL of the default page would be `http://localhost:1880/uib/` |
| userDir   | The folder used by Node-RED to store all settings, configuration and flows for a running instance of Node-RED<br />Default location: `<userHome>/.node-red/` |
| userHome  | The operating system folder designated as the "home" folder for the user ID running Node-RED. |
| vendor    | A 3rd party. In this case, refers to any 3rd-party package installed via `npm`. |

