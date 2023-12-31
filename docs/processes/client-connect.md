---
title: Client connection process
description: |
  The process when a new client (browser tab) connects to a uibuilder endpoint.
created: 2022-06-28
lastUpdated: 2022-06-28 18:08:03
updated: 2023-12-30 17:01:41
---

## Process

### Browser

* Loads uibuilder client

### uibuilder client

* Instantiates Uib class and assigns global (window) `uibuilder` and `$` objects
* Creates socket.io client object and attempts to connect to socket.io server

### uibuilder node

* Sends "client connect" message to output port #2
* Sends "client connect" message to client

### uibuilder client

* Receives "client connect" control message.
* Returns "ready for content" message to server with `msg.cacheControl` set to "REPLAY" to trigger cache replay if needed.

## uibuilder server log

```log
TRACE| [uibuilder:socket:test-uib-list-iife:disconnect] Client disconnected, clientCount: 0, Reason: transport close, ID: Q-XrIeYsqgxGVrKGAAA4, IP Addr: ::ffff:127.0.0.1, Client ID: xeXBgHDfAEdqwy13P6gJY. For node ed943c4571535c87
TRACE| [uibuilder:socket.js:sendToFe:test-uib-list-iife] msg sent on to client Q-XrIeYsqgxGVrKGAAA4. Channel: uiBuilderControl. {"uibuilderCtrl":"client disconnect","reason":"transport close","_socketId":"Q-XrIeYsqgxGVrKGAAA4","version":"5.1.0-iife.min","ip":"::ffff:127.0.0.1","clientId":"xeXBgHDfAEdqwy13P6gJY","pageName":"index.html","connections":1,"from":"server"}

TRACE| [uibuilder:socket:addNS:test-uib-list-iife:connect] Client connected. ClientCount: 1, Socket ID: DaPaq98xVZZjzdT1AAA6, IP Addr: ::ffff:127.0.0.1, Client ID: xeXBgHDfAEdqwy13P6gJY. For node ed943c4571535c87
TRACE| [uibuilder:socket.js:sendToFe:test-uib-list-iife] msg sent on to client DaPaq98xVZZjzdT1AAA6. Channel: uiBuilderControl. {"uibuilderCtrl":"client connect","serverTimestamp":"2022-06-28T17:15:05.930Z","version":"5.1.0-prerelease","_socketId":"DaPaq98xVZZjzdT1AAA6","from":"server"}
TRACE| [uibuilder:socket:test-uib-list-iife] Control Msg from client, ID: DaPaq98xVZZjzdT1AAA6, Msg: {"uibuilderCtrl":"ready for content","cacheControl":"REPLAY","from":"client","_socketId":"DaPaq98xVZZjzdT1AAA6"}
```

## Client log (TRACE level)

```log
18:04:34.632 uibuilder.module.js:1688 ❗ info [Uib:ioSetup] ✅ SOCKET CONNECTED. Connection count: 1
Namespace: /test-uib-list-iife
18:04:34.632 uibuilder.module.js:1606 trace [Uib:checkConnect] Checking connection. Connected: true. Timer: 2. Depth: 1. Delay: 2000. Factor: 1.5 I {connected: true, receiveBuffer: Array(0), sendBuffer: Array(0), ids: 0, acks: {…}, …}
18:04:34.633 uibuilder.module.js:424 trace [Uib:set] prop set - prop: ioConnected, val:  true
18:04:34.633 uibuilder.module.js:424 trace [Uib:set] prop set - prop: socketError, val:  null
18:04:34.633 uibuilder.module.js:597 trace [Uib:checkTimestamp:uiBuilder (server)] Offset changed to: 0 from: null
18:04:34.634 uibuilder.module.js:424 trace [Uib:set] prop set - prop: serverTimeOffset, val:  0
18:04:34.634 uibuilder.module.js:424 trace [Uib:set] prop set - prop: ctrlMsg, val:  {uibuilderCtrl: 'client connect', serverTimestamp: '2022-06-28T17:04:34.491Z', version: '5.1.0-prerelease', _socketId: 'RV1Zo5NKm2vNOSdsAAA2', from: 'server'}from: "server"serverTimestamp: "2022-06-28T17:04:34.491Z"uibuilderCtrl: "client connect"version: "5.1.0-prerelease"_socketId: "RV1Zo5NKm2vNOSdsAAA2"[[Prototype]]: Object
18:04:34.634 uibuilder.module.js:424 trace [Uib:set] prop set - prop: msgsCtrlReceived, val:  1
18:04:34.634 uibuilder.module.js:1511 trace [Uib:ioSetup:_ctrlMsgFromServer] Channel 'uiBuilderControl'. Received control msg #1 {uibuilderCtrl: 'client connect', serverTimestamp: '2022-06-28T17:04:34.491Z', version: '5.1.0-prerelease', _socketId: 'RV1Zo5NKm2vNOSdsAAA2', from: 'server'}
18:04:34.634 uibuilder.module.js:1524 trace [Uib:ioSetup:uiBuilderControl] Received "client connect" from server
18:04:34.635 uibuilder.module.js:1525 ❗ info [Uib:ioSetup:uiBuilderControl] ✅ Server connected. Version: 5.1.0-prerelease
Server time: 2022-06-28T17:04:34.491Z, Sever time offset: 0 hours
18:04:34.635 uibuilder.module.js:424 trace [Uib:set] prop set - prop: sentCtrlMsg, val:  {uibuilderCtrl: 'ready for content', cacheControl: 'REPLAY', from: 'client', _socketId: 'RV1Zo5NKm2vNOSdsAAA2'}
18:04:34.635 uibuilder.module.js:424 trace [Uib:set] prop set - prop: msgsSentCtrl, val:  1
18:04:34.635 uibuilder.module.js:1319 debug [Uib:_send]  Channel 'uiBuilderControl'. Sending msg #1 {uibuilderCtrl: 'ready for content', cacheControl: 'REPLAY', from: 'client', _socketId: 'RV1Zo5NKm2vNOSdsAAA2'}
```

## Server log if client reconnects without reloading

```log
TRACE| [uibuilder:nodeInstance:test-uib-list-iife] ================ instance registered ================
TRACE| [uibuilder:nodeInstance:test-uib-list-iife] node keys: ["id","type","z","g","_closeCallbacks","_inputCallback","_inputCallbacks","wires","_wireCount","send","credentials","name","topic","url","oldUrl","fwdInMessages","allowScripts","allowStyles","copyIndex","templateFolder","extTemplate","showfolder","reload","sourceFolder","deployedVersion"]
TRACE| [uibuilder:nodeInstance:test-uib-list-iife] config keys: ["id","type","z","g","name","topic","url","fwdInMessages","allowScripts","allowStyles","copyIndex","templateFolder","extTemplate","showfolder","reload","sourceFolder","deployedVersion","x","y","wires"]
TRACE| [uibuilder:nodeInstance:test-uib-list-iife] Deployed Version: 5.1.0-prerelease
TRACE| [uibuilder:nodeInstance:test-uib-list-iife] Node instance settings: {"name":"","topic":"","url":"test-uib-list-iife","copyIndex":true,"fwdIn":false,"allowScripts":false,"allowStyles":false,"showfolder":false}
TRACE| [uibuilder:nodeInstance:test-uib-list-iife] Node uib.Instances Registered: {"98099c64ffd4a63a":"aa","2680d988b0065b7f":"cms","08c4ce621b78b423":"dynamic","30966f8daba4863c":"components-svelte","c1c1273697d0c0d3":"components-html","b4bbe2861dcfb3e9":"comp2","04b56fb46b6a6c59":"svelte-basic","bee678619b7041e4":"cms2","7de5cb37740c6b10":"loggy","0b43f771f61a76fb":"vue2","3f7279e1cbeac29f":"primevue-vue3","f22b8329ec19712c":"quasar-vue3","c6d5ea48b39d1428":"uib-sender-example","d0b6170b92cd6064":"iife","bd730cfdbe646bd4":"fast-element","ed943c4571535c87":"test-uib-list-iife"}
TRACE| [uibuilder:nodeInstance:test-uib-list-iife] Number of uib.Deployments: 1
TRACE| [uibuilder:nodeInstance:test-uib-list-iife] Using local front-end folders in: \src\uibRoot\test-uib-list-iife
TRACE| [uibuilder:web.js:instanceSetup] Setup for URL: test-uib-list-iife
TRACE| [uibuilder:web:setupInstanceStatic:test-uib-list-iife] Using local src folder
TRACE| [uibuilder:nodeInstance:test-uib-list-iife] URL . . . . .  : /test-uib-list-iife
TRACE| [uibuilder:nodeInstance:test-uib-list-iife] Source files . : \src\uibRoot\test-uib-list-iife

INFO | Started flows
TRACE| [uibuilder:socket:addNS:test-uib-list-iife:connect] Client connected. ClientCount: 1, Socket ID: _Iqtmv7tQHp7zs53AAAE, IP Addr: ::ffff:127.0.0.1, Client ID: xeXBgHDfAEdqwy13P6gJY. For node ed943c4571535c87
TRACE| [uibuilder:socket.js:sendToFe:test-uib-list-iife] msg sent on to client _Iqtmv7tQHp7zs53AAAE. Channel: uiBuilderControl. {"uibuilderCtrl":"client connect","serverTimestamp":"2022-06-28T17:22:36.196Z","version":"5.1.0-prerelease","_socketId":"_Iqtmv7tQHp7zs53AAAE","from":"server"}
TRACE| [uibuilder:socket:test-uib-list-iife] Control Msg from client, ID: _Iqtmv7tQHp7zs53AAAE, Msg: {"uibuilderCtrl":"ready for content","cacheControl":"REPLAY","from":"client","_socketId":"_Iqtmv7tQHp7zs53AAAE"}
```

Only the last part is relavent in this process. Note how the client still asks for a REPLAY. So I will add connections, ip address and pageName to that message as well.