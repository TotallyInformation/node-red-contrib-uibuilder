---
title: uibuilder url change - rename
description: |
  The process to change the url of a previously deployed instance of uibuilder. Also needing to rename the underlying folder.
created: 2022-06-26
lastUpdated: 2022-06-27 10:28:19
updated: 2023-12-30 17:01:41
---

## Editor (`nodes/uibuilder.html`, `src/editor/uibuilder/editor.js`)

* Change the content of the url field.
* Editor gives warnings.

  ```
  URL does not yet exist. You must Deploy first.
  If changing a deployed URL, the folder will be renamed on Deploy
  ```

* click "Done".
* Re-deploy immediately.
* Folder is renamed
* Old ExpressJS route is removed, new one added


### Log

```
TRACE| [uibuilder:admin-router:GET:listinstances] Returning a list of deployed URLs (instances of uib).
TRACE| [uibuilder:admin-router:GET:checkfolder] See if a node's custom folder exists. URL: loggm
TRACE| [uibuilder:admin-router:GET:listinstances] Returning a list of deployed URLs (instances of uib).
TRACE| [uibuilder:admin-router:GET:checkfolder] See if a node's custom folder exists. URL: logg
TRACE| [uibuilder:admin-router:GET:listinstances] Returning a list of deployed URLs (instances of uib).
TRACE| [uibuilder:admin-router:GET:checkfolder] See if a node's custom folder exists. URL: loggy
TRACE| [uibuilder:admin-router:GET:listinstances] Returning a list of deployed URLs (instances of uib).
TRACE| [uibuilder:admin-router:GET:checkfolder] See if a node's custom folder exists. URL: loggy
TRACE| [uibuilder:admin-router:GET:listinstances] Returning a list of deployed URLs (instances of uib).
TRACE| [uibuilder:admin-router:GET:checkfolder] See if a node's custom folder exists. URL: loggy
DEBUG| saved flow revision: 3c4c546dbc87eba28f8704e72505b844

INFO | Stopping modified nodes
TRACE| [uibuilder:nodeInstance:close:loggme] nodeInstance:on-close: Node (re)deployed
TRACE| [uibuilder:uiblib:instanceClose:loggme] Running instance close.
TRACE| [uibuilder:socket.js:sendToFe:loggme] msg sent on to ALL clients. Channel: uiBuilderControl. {"uibuilderCtrl":"shutdown","from":"server"}
INFO | Stopped modified nodes

INFO | Starting modified nodes
TRACE| [uibuilder:nodeInstance:loggy] ================ instance registered ================
TRACE| [uibuilder:nodeInstance:loggy] node keys: ["id","type","z","g","_closeCallbacks","_inputCallback","_inputCallbacks","wires","_wireCount","send","credentials","name","topic","url","oldUrl","fwdInMessages","allowScripts","allowStyles","copyIndex","templateFolder","extTemplate","showfolder","reload","sourceFolder","deployedVersion"]
TRACE| [uibuilder:nodeInstance:loggy] config keys: ["id","type","z","name","topic","url","fwdInMessages","allowScripts","allowStyles","copyIndex","templateFolder","extTemplate","showfolder","oldUrl","reload","sourceFolder","deployedVersion","x","y","wires"]
TRACE| [uibuilder:nodeInstance:loggy] Deployed Version: 5.0.2
TRACE| [uibuilder:nodeInstance:loggy] Node instance settings: {"name":"","topic":"","url":"loggy","copyIndex":true,"fwdIn":false,"allowScripts":false,"allowStyles":false,"showfolder":false}
TRACE| [uibuilder:nodeInstance:loggy] Node uib.Instances Registered: {"98099c64ffd4a63a":"aa","2680d988b0065b7f":"cms","08c4ce621b78b423":"dynamic","30966f8daba4863c":"components-svelte","c1c1273697d0c0d3":"components-html","b4bbe2861dcfb3e9":"comp2","04b56fb46b6a6c59":"svelte-basic","bee678619b7041e4":"cms2","0b43f771f61a76fb":"vue2","3f7279e1cbeac29f":"primevue-vue3","f22b8329ec19712c":"quasar-vue3","d0b6170b92cd6064":"iife","bd730cfdbe646bd4":"fast-element","c6d5ea48b39d1428":"uib-sender-example","7de5cb37740c6b10":"loggy"}
TRACE| [uibuilder:nodeInstance:loggy] Number of uib.Deployments: 3
TRACE| [uibuilder:nodeInstance:loggy] Folder renamed from loggme to loggy
TRACE| [uibuilder:nodeInstance:loggy] Using local front-end folders in: \src\uibRoot\loggy
TRACE| [uibuilder:web.js:instanceSetup] Setup for URL: loggy
TRACE| [uibuilder:web:setupInstanceStatic:loggy] Using local src folder
TRACE| [uibuilder:nodeInstance:loggy] URL . . . . .  : /loggy
TRACE| [uibuilder:nodeInstance:loggy] Source files . : \src\uibRoot\loggy
INFO | Started modified nodes
```