---
title: Comparison between uibuilder and fromcubes-portal-react
description: |
  UIBUILDER has a significantly different design philosophy to fromcubes-portal-react.
  This page examines some of the key differences, their potential impacts and different workflows.
created: 2026-07-15 10:14:56
updated: 2026-07-15 17:02:18
---

Please do not use this comparison table to criticize one approach or the other, both approaches are deliberately different. Giving greater choice and flexibility for Node-RED users. Also note that I am much more familiar with UIBUIDER as its main author than I am of fromcubes-portal-react, updates and corrections are always most welcome.

The following table is not in any specific order of importance.

| Capability                         | <img src="./images/node-blue.svg" style="width:25px;vertical-align: middle;" /> [UIBUILDER](https://flows.nodered.org/node/node-red-contrib-uibuilder) | [fromcubes-portal-react](https://aaqu.github.io/fromcubes-portal-react/) |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Skill level needed                 | Simple HMTL only.                                            | REACT, Tailwind, REACT Components, JSX, Javascript.          |
| URL Flexibility                    | Any URL can be used.                                         | Only sub-paths of `/fromcubes/` can be used.<br />? Does it respect httpRoot setting? |
| ExpressJS web config flexibility   | Can use a custom ExpressJS instance if desired, with separate settings and middleware than Node-RED's own user-facing instance. | Uses Node-RED's user-facing instance.                        |
| UI flexibility                     | Can use any or no FE framework.<br />Reuse any HTML/CSS/JS skills. | Forced to use REACT and Tailwind frameworks.                 |
| Issues                             |                                                              | 1. Preview does not work if not already deployed.<br />2. Help shows `/fromcubes/*` as URL but actual URL has `httpRoot` prepended.<br />3. Default config produces an error, StatusCard component missing.<br />4. Minimal input example doesn't work - no input. Websocket connection not receiving data - httpRoot issue? - Several forced reloads required before it started working. Still did not show on screen. Cannot enter new value on screen.<br />5. Live chart example does not work on import. Missing components. Must also import "Shared Components" |
| Auto-update UI after config change | Optional                                                     | Yes                                                          |
| Websocket                          | Uses Socket.IO for maximum resilience, security and flexibility. | Raw websocket only. May have problems traversing some networks. |
| Styling                            | Sensible reset and styles. Mostly relative and reactive sizing | Tailwind complexity. Additional, mostly px fixed sizing.     |
| Nodes                              | Built-in code editor, uses standard Node-RED Monaco.         | Main node does not appear to use standard Monaco code editor (no intellisense, different font). |
| No-/low-code                       | Custom low-code schema, no-code nodes                        | None.                                                        |
| Client size and performance        | Typically small, efficient pages and minimal data transfer. Use of static data allows for good transparent caching.<br />Example very simple page:<br />Uncached = 17 requests, **239kB** transferred, 341kB resources, 398ms.<br />Cached = 17 requests, **5.4kB** transferred, 341kB resources, 385ms. | Uncached = 4 requests, 74.6kB transferred, 218kB resources. 422ms.<br />Cached = 3 requests, 64.9, 216kB, 415ms |
| Filing system use                  | Root folder can be set via settings.js<br />Root folder obeys project folders by default.<br />Can use standard web tools for development. Or can use NR Editor. | Fixed as `<userDir>/fromcubes`.<br />Code editing in NR Editor only. |
| Security & client identifiers      | Socket.IO session id, client id (fixed while browser is open), tab id.<br />Standard proxy headers supported, including standard client ID's. | Websocket id only, changes if page is re-loaded.<br />Option to support proxy headers. |
| Node-based "widgets"               | Single node type. Pre-built "components" - outputs low-code JSON which can be further enhanced. Additional nodes for fully custom low-code components.<br />JSON is hydrated in the front-end or on the server (via the uib-html node).<br />Can also use any web component. | Single node type. REACT/JSX code only. Server hydrated only. |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |
|                                    |                                                              |                                                              |

