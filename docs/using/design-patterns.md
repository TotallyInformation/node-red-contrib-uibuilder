---
title: Common design patterns
description: |
  UIBUILDER is designed to be as flexible as possible so this should not be considered a _definitive_ list of design patterns.
  However, these are probably the most common.
created: 2024-06-19 09:26:14
updated: 2024-06-20 17:28:43
---

> [!TIP]
> Because of UIBUILDER's flexibility, these patterns are **not** mutually exclusive. They can be mixed at will.

## Static files, data-driven comms

This is the original and probably still the most common design pattern.

You write your HTML, CSS and JavaScript into static files on the Node-RED server. This allows you to use standard web development tools and processes as desired. Node-RED and uibuilder between them make these files available as web resources automatically.

> [!NOTE]
> All of the design patterns make use of at least the `index.html` static file which must be present and contain the minimum code to load the uibuilder front-end library. Typically the `index.css` file is also used to provide styling. These are included in all of the _[templates](/walkthrough1#choosing-a-template)_.

Data is sent to the browser over websocket connections that uibuilder creates for you and you have several methods for watching for new data and processing and/or displaying it.

Data can be returned to Node-RED from the browser over the same websocket connections. `uibuilder.send({....})` can be used in front-end code to send data back to Node-RED, the object parameter takes the same form as messages in Node-RED itself. `uibuilder.eventSend(event)` can be used as the action for any HTML event (typically on `<input>` tags), it will capture useful information automatically and send it. The uibuilder client library also has several functions internally that send information back to Node-RED.

## No-code

This is a good pattern for people with little to no experience with HTML and who do not wish to learn. It is also good for rapid prototyping.

However, on its own, it limits you to doing things that someone else has already prepared.

But UIBUILDER's no-code nodes all output low-code configuration data (JSON) which means that they can be used not only with the uibuilder client library but also with the `uib-html` node which will "hydrate" the configuration into HTML just like the client library. In turn, that means that no-code outputs can be used with Node-RED core `http-in`/`-response` nodes **and** even with Node-RED Dashboards.

It also means that you can further manipulate the output before sending it to the clients.

## Low-code

As mentioned above, UIBUILDER's low-code feature takes standardised JSON formatted configuration data and "hydrates" it to full HTML. The defined schema's allow for creation, update and removal of page content. They also allow for the loading of external content as well as dynamic data from Node-RED flows.

Because the data is simple JSON, complex UI's can be configured from simple building blocks (which is what the no-code nodes do). And because the terminology used is as close as possible to standard HTML, learning to use the low-code data helps learn full HTML where that is desirable.

UIBUILDER low-code is _**not a framework**_, it is simply an enhancement of standard HTML to make it easier and more consistent to deal with. This is a critical point because it means that you _never_ reach the cliff-edge that is common with frameworks where you end up fighting the framework as much as it is helping.

The output of the low-code feature is _**HTML**_.

## Node-RED updated static file

This pattern makes extensive use of static files just like the first option. However, with this pattern, the "static" files are updated from within Node-RED using the `uib-html` and `uib-save` nodes.

Remember, the [serving of static files](https://www.techopedia.com/definition/5399/static-web-page) is generally the most efficient way to serve web content. It enables the caching of the page and may minimise data transfers and dynamic processing

So this pattern is good when you have pages and data that do not update rapidly and even better the more clients you have making use of the resources.
