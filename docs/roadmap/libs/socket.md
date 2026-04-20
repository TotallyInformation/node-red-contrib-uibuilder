---
title: socket.cjs and front-end comms roadmap
description: >
  This page is a working document to track the development of the socket.cjs module and related front-end communication features. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development.
  It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-04-19 14:45:25
updated: 2026-04-19 14:45:33
author: Julian Knight (Totally Information)
---

## Socket.IO rooms
[ref](https://socket.io/docs/v4/rooms/) - Rooms can be used to filter messages for specific destinations (e.g. client or page id) or to create client-to-client comms.

  * Need a way to join rooms from Node-RED

  * socket.cjs
    * [x] Auto-join `clientId:xxxxxxx` & `pageName:xxxxxxx` rooms
    
    * [x] socket.on uib-room-join/-leave-send
    
    * [ ] Change send functions to use rooms where clientId/pageName is specified in `msg._uib`
    
    * [ ] `socket.on('uib-room-send', ...)` Add option to also send a uibuilder msg.
    
    * [ ] Incorporate `msg._uib.roomId` for sending to custom rooms
    
    * [ ] ? Allow sending to different uib namespaces? would likely need an option flag for security?
    
    * [ ] Allow global as well as NS rooms - allow sending between different uib connected clients. 
          [ref](https://socket.io/docs/v4/socket-io-protocol/#introduction) - `this.io.of('/').emit('uibuilder:global', 'Hello from the server. NS: "/"')`
    
  * client
    * [x] joinRoom, leaveRoom, sendRoom - allows clients to join/leave/message any arbitrary room
    * [x] Add additional listener for the default (global) namespace
    * [ ] Add `globalSend` function
    * [ ] Add listener when joining a room, remove when leaving
    * [ ] Document new managed var: `globalMsg`.
