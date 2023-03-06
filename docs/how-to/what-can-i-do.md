---
title: What can I do with uibuilder?
description: >
   A summary of some of the key things that can be done by combining uibuilder with Node-RED.
created: 2023-03-06 10:04:37
lastUpdated: 2023-03-06 10:04:42
author: Julian Knight (Totally Information)
---

* Use my data in Node-RED (or in front-end code) to generate standard or custom user-interfaces (UI's, web pages). I don't have to learn the details of how to create HTML elements.
* Easily update on-page information either from Node-RED or front-end code. Eliminating the inconsistencies inherent in the DOM/HTML standards.
* Communicate between Node-RED and front-end code. Reliable and consistent. Carries additional data useful for making security decisions.
* Create my own tools that generate msg._ui standard output that creates/manipulates my web pages. uibuilder isn't just about uibuilder.
* Cache UI/data changes either in Node-RED or in the front-end. Enabling newly connected clients (or reloaded clients) to get the latest UI and data.


## What will I be able to do soon?

* Save live HTML back to Node-RED. Save to uibuilder folders or pass to other tools. Use to increase performance and reduce overheads.
* Listen for changes on my web pages and send information back to Node-RED (or to front-end code) - using "watch" functions that detect changes and create a custom event and send standard data back to Node-RED.
* Send front-end logging information back to Node-RED.
