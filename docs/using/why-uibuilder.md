---
title: Why would I want to use UIBUILDER?
description: |
  Node-RED has several ways to deliver web pages already. Why would I want to use UIBUILDER instead? And are there any times I might not want to use it?
created: 2023-09-24 02:18:26
lastUpdated: 2023-09-24 20:39:51
updated: 2024-06-14 16:56:48
---

## Potential benefits

- *Web pages with integrated websockets and other support tools*.
  
  Probably the thing people will notice first. A single `uibuilder` node creates a very lightweight web application leaning on the power of Node-RED.

  Not only do you get a dedicated space on the Node-RED server for any front-end code that might be needed, you get a dedicated real-time websocket connector to your front-end.

  No code is needed for any of this. Even the simplest template gets you going straight out of the box.

- *External libraries*.
  
  When you need the help of additional front-end libraries, UIBUILDER makes it easy to install and manage right from Node-RED's graphical Editor. Under the skin, that uses standard `npm` tooling that lets you load libraries from the standard npm catalogue, GitHub, or local folders.

  Libraries are made available to the front end using a standard URL path. Making it easy to put in a minor single line of code to load the library. This can even be done via a command from Node-RED if needed (no-code).

- *Templates*.
  
  UIBUILDER has a number of simple, built-in templates. These provide all the code needed to get you started.

  In addition, anyone can define external templates that you can load to your own flows.

  Templates do not have to be simple, however, they can include their own dev dependencies, instance API definitions, source and distribution code, images and other resources as needed.

- *Combine no-code, low-code and front-end code approaches*.
  
  UIBUILDER's philosophy is that it won't lock you in. This holds true when it comes to using its no-code and low-code capabilities. You can mix and match these but you can also mix and match with front-end HTML, CSS, and JavaScript.

  As your web app or dashboard matures, if you want or need to move from no-code to low-code through to a full web development environment, you can.

- *Multi-user web apps*.

  UIBUILDER web apps and dashboards have some basic client identifiers built in, these can help with multi-user workflows.
  
  Also built-in is the ability to filter inputs and outputs not only from a client device but also by page name.

  It also has server "middleware" features both for the web server and for the real-time websockets server. These optional functions allow you to include identity and access management features for additional security where desired.

- *Easier & standardised multi-developer workflows*.

  The person or people developing your front-end might well be part of a web development team and might perhaps have no experience with Node-RED. UIBUILDER fully supports this by allowing front-end development to use all of the standard tools and methods that a web development team might use. But it does not force you to work that way. As always, you can start simple in Node-RED alone and extend with front-end development later if desired.

- *Not bound to a front-end framework, but can use any of them if desired*.

  With its "no lock-in" approach, UIBUILDER will not force you to use a specific front-end framework (Vue, REACT, etc) and indeed, with modern HTML, CSS, and JavaScript, a framework may not be needed or desired.

  But if you want to use one, you can use any of them. If you or your web development team have skills in one framework, then you can use it.

- *Multiple web apps*.

  You are not limited to a single web app or dashboard. UIBUILDER lets you have any number of them in a Node-RED instance. All that is required is that each has a unique identifier that defines its URL path.

- *Use different web server settings than Node-RED*.
  
  You can choose to use the same ExpressJS web server that services the core nodes and Dashboard if you like, this is the default. But if you need to have a completely separate configuration, this is possible as well via a very simple configuration setting.

- *Performance and browser resource usage*

  Since UIBUILDER does not need a front-end framework and since it works of mostly static resources rather than always having to generate and transfer code and data to create pages on the fly, UIBUILDER is typically a lot faster and smaller to load in the browser. It still has the _capability_ to do dynamic transfers but even then, mostly uses low-code configuration data which tends to be smaller.

  For a mostly blank page loaded (not cached) on a fairly fast PC, Dashboard 2 transefers around 1.2MB of data, uses around 4MB of browser resource and loads in around 0.6 seconds. By comparison, a similar uibuilder page transfers around 134kB, uses around 213kB of browser resources and loads in around 0.2 seconds. For a cached page, the transfer is about the same for both and the load time is around .6s for D2 and .2 for uibuilder.

## Alternatives

* *Dashboard 1*.

  The original data-driven web app builder for Node-RED. Originally called `UI` and gifted to the community by the original dev. Largely now maintained by one of the core devs. It uses the AngularJS v1 front-end framework but is wrapped in such a way that not all of the framework is accessible to nodes.

  Various contributed nodes now exist and there is a `ui_template` node for things that the other nodes do not support. Note that AngularJS v1 is now end-of-life and no longer being developed.

  Dashboard is great for quickly getting going. However, like many framework solutions, it is not uncommon to reach a "cliff edge" where you have to start fighting the framework rather than it helping you.

  However, Dashboard is not multi-user aware. While some people have partially worked around this, there will generally be limitations.

  Note that Dashboard's front-end code is very "heavy" which can be a problem with some limited-spec clients. It also has to send a lot of data dynamically to the front-end from the Node-RED server.

* *Core nodes: http-in/http-out/websocket-in/websocket-out/template*.

  These nodes can be used in order to create a data-driven web app. However, you are entirely on your own for creating both the back-end and front-end logic/code. It absolutely works but can be a lot of effort. You will also need to craft your own visual layout and formating as well as realtime communications should you need them.

* *"Dashboard 2"*.

  Developed by the FlowForge commercial organisation, this is positioned as the next replacement for "Dashboard 1". It is based on the Vue v3 front-end framework instead of the defunct AngularJS v1. It also uses the Vuetify extended framework.

  A simple, non-cached page is around 1.3MB transfer, uses around 4MB browser resources and takes .6s to load on a fast desktop. Compared to around 134kB/213kB/.2s for UIBUILDER.

There are a number of other possible contributions, but none are production ready and most are abandoned.

With the exception of the core nodes, all of the alternatives bind you to a specific front-end framework.

## Are there situations NOT to use uibuilder?

Absolutely. 

* *If you need to get going really quickly and haven't used uibuilder before*.
  
  Dashboard gets you going instantly and gives you a limited layout without faffing.

  Just have a think about whether you will reach the "cliff edge" where you find yourself writing everything using `ui_template` nodes and fighting with the framework.

* *If you need layout help from within Node-RED*.

  UIBUILDER does not yet have a GUI layout editor like Dashboard does. We hope to get one eventually and even before then, we expect to provide more layout helpers to make things easier.

  Remember though that Dashboard 1's layout editor is a simple grid layout only. It will not help with more complex layouts. Dashboard 2 has a lot more layout control but may still get in the way if you want truly custom layouts or want to work with front-end frameworks other than VueJS v3+Vuetify.

* *If your Node-RED instance is hosted without a filing system*.

  Currently, UIBUILDER requires a filing system to work with. There are a few cloud environments (such as FlowForge) that do not provide a filing system. In these few cases, it is not currently possible (or at least not easy) to use UIBUILDER.

* *If you don't need any of UIBUILDER's features or its freedom and flexibility*.
  
  😉
