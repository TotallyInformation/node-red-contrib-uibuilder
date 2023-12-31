---
title: Using the Svelte framework with uibuilder
description: |
  How to make good use of the Svelte front-end framework with uibuilder and Node-RED.
created: 2022-02-26 19:40:00
lastUpdated: 2023-09-30 13:08:35
updated: 2023-12-30 17:01:41
---

The Svelte framework turns out to be one of the easiest frameworks to use in conjunction with uibuilder of those that requires a build step.

One of the main reasons for this is that it's development server "just works" even when accessing the page via Node-RED rather than directly using the development server. When you make changes to the source code, if you have Svelte's development server running (with `npm run dev` in your instance root folder), any changes will instantly show up in your front-end.

Svelte is also a very easy framework to use and constantly rates very highly with developers. It also aligns closely to the emerging web components standards.

?> Note: uibuilder v5 comes with a simple Svelte template that you can use with the instructions below.

?> Also Note that you do not need to install Svelte using uibuilder's Libraries tab. It needs to be installed locally in the instance folder

## Using with uibuilder

These instructions assume that you have installed Node-RED using the "standard" instructions and are running it in the usual way. Make sure that you know how you've installed things before continuing. The `~/.node-red/` folder used below is actually referred to as the "userDir folder" and may be different on your configuration. In addition the `~/.node-red/uibuilder/` folder is referred to as the "uibRoot folder". It may also be moved from the default location.

1) Create a new uibuilder instance and change the url to `svelte` (or whatever you want). Click on Deploy.
2) Change the template to "Svelte Basic". Accept the warning.

   The Svelte Basic template includes all of the configuration required to get up and running and even includes the built version of the code in the `dist` folder so that you don't need to do any build at all until you want to change something. See the README.md file that the template includes for further information.

   Please remember to remove the following files from the `src` folder: `index.html`, `index.css`, `index.js`. These will be left behind if you deployed your `uibuilder` node with the basic template before switching to the Svelte Basic template.

3) Change the "Serve" setting from `src` to `dist` in the settings panel and re-deploy.

4) Open a command line to the _instance root folder_, e.g. `~/.node-red/uibuilder/svelte`

5) From the instance root folder run the command `npm install && npm run dev`

   Note that the dev process creates its own web server but you should ignore that. Just leave it running if you want to have your web page auto-reload when you make changes to the files in `src`.

6) Now load the uibuilder page with `http://127.0.0.1:1880/svelte/` (or wherever yours ends up)

Marvel at the amazing dynamic, data-driven web app you just made with a few clicks!

?> Once you have made whatever changes you want, you can exit the dev server and run `npm run build`. This will update the `/dist/build/` bundles with optimised versions ready for production. The template includes built bundles so that you can run it straight out of the box.

## Going further

OK, so not the most amazing thing. But lets note a couple of important points. (Restart the dev server first if you exited it above.)

* Make a change to the text in the `App.svelte` page and save it - notice anything on your web page? 

   Yup, it changed without you having to reload it! Just like Svelte's own dev server :grin: 

* Attach a debug node to the output of your `uibuilder` node. Make sure it is set to show the whole msg object. Now click on the button on your page. Notice that you get a message just by clicking the button, no code required (other than the HTML for the button itself).

   That uses the new eventSend function in uibuilder v3.2

   Note how the `data-xxxx` attributes are sent back to node-red in the payload, one of which is dynamic thanks to Svelte. Also note that the `msg.uibDomEvent.sourceId` in node-red contains the text of the button. Try adding an id attribute to the button to see what difference it makes.

* Send a msg to the `uibuilder` node and note how the payload appears on the page

   5 lines of code in total to do that :grin: 

Just a few lines of actual code for a simple, data-driven web page. Not too bad I think.

?> Some features will be added to uibuilder in a future release that will make this even easier. <br><br>There will be buttons in the Editor panel for `uibuilder` nodes the will let you run any npm scripts defined in your `package.json` file. For Svelte, that will include `install`, `build` and `dev` buttons. So that most of the above steps will be reduced to a couple of clicks. <br><br>These changes will help anyone who needs a build step for their web app, not just be for Svelte users.

## References

Some helpful reference information.

* [MDN: Getting Started with Svelte](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Svelte_getting_started)
