---
title: What makes a good Node-RED Dashboard framework?
description: |
  Lays out what I think a good framework for building Node-RED dashboards would look like and what features it would have.
created: 2021-09-17 09:28:09
lastUpdated: 2023-09-30 15:01:50
updated: 2023-12-30 17:01:41
---

Status: **Incomplete**

## Feature Summary

* Communications between Node-RED and the front-end page and components
* Ability to define UI components that can:
  * Be reused
  * Be communicated with to/from Node-RED
  * Can be incorporated into page layouts
  * Can be written independently of the core
  * Can be easily installed by Node-RED admins/editors using npm & the existing Palette Manager
  * Can be used via code by developers AND via nodes for non-developers
* Easy, no-code layout screen builder tool
* Multiple pages. Not just multiple tabs.
* Back-end authentication and authorisation - plug & play extendable, custom extendable, session capable, self-service capable, security tested
* Front-end user authentication and authorisation helpers - Standard library for: A function and component for doing logon/logoff, extensible by configuration to allow for user metadata, a component for self-sign-up
* Some common components would be needed - these could be core or contributed but probably best as core:
  * Page container
  * Tabs container
  * Card container (displays a card with other content within it)
  * Dialogue box (modal and non-modal, options for buttons, rich content)
  * Alert (auto-expire and manual clear, different categories)
  * Basic chart
  * Basic output (text, numbers, dates, times, ...)
  * Basic inputs (text, numbers, dates, times, passwords, extended text)

## UIBUILDER Thoughts

### Extension node

**Alternatives**: 
* An alternative would be for the installation of a uib extension node to trigger a build step. But this would need default builds for all frameworks.
* Another alternative is to move instance config to a config node

* Registers config object: might define msg schema, width/ht or any other common props - probably contains instructions for the front-end to auto-load and attach to the appropriate framework app.
* Registers front-end code folder: contains front-end code that is made available to all uibuilder instances - allows uib extensions to cater for ANY front-end framework.
* Front-end code must be written in a way to self-execute
* Each Instance:
  * Uses a uibuilder instance's URL name - drop-down box for chosing.
  * Has its own config
  * When a client (re)connects to the matching instance of uib, it is sent the extension/component config in the initial connect control msg.
    _NB: uibuilderfe should probably dynamically load the appropriate code resources._
  * Msgs sent to the instance are changed to match the appropriate schema and then sent to the front-end

### On socket connect

* send cached
  * Layout - page-width
  * defined cards
