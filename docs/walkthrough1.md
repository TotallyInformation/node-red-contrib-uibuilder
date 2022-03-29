---
title: A first-timers walkthough of using uibuilder
description: >
   If you haven't used uibuilder before, it can be a little confusing as it brings together concepts from
   several different worlds. This walkthrough takes you from nothing to a basic data-driven web page.
created: 2021-09-24 11:02:56
lastUpdated: 2022-03-27 13:30:46
---

Like uibuilder itself, this walkthrough may look complex. But you should bear in mind that if you follow the 7 steps in the [How to get started](#how-to-get-started-4-steps-to-a-data-driven-web-app) section, that is basically it.
The rest starts to unpack some of the things that you can then do with uibuilder and how to do them. Please consider them as additional walkthroughs.

## What is uibuilder

Node-RED's Dashboard and uibuilder are both different approaches to the same use-case. How to present data to users in a web browser tab and get information back from them into Node-RED. Remembering that the users browser and the Node-RED server are completely different environments and may be on different devices.

We refer to this as a "data-driven web application".

uibuilder was created in order to provide Node-RED users with a flexible alternative to the Dashboard.

Dashboard is extremely simple to start using and great for doing relatively straight-forward UI's very quickly.
However, if you want to do more complex things, you quickly hit the brick-wall that is common with many frameworks.
Suddenly things go from being very simple to very complex.

uibuilder takes the opposite approach to Dashboard. Its main purpose is to be a _foundation_ on which you can build whatever you like, however you like.

It does the complex background tasks for you and then gets out of the way.

uibuilder is a *bridge* between the Node-RED server and any connected clients (web browser tabs). Each browser tab pointing at the same uibuilder instance is a *client* and you can have many clients running from 1 browser, 1 device/many browsers or different devices - however you like.

## How to get started - 4 steps to a data-driven web app

It may look complex, but really it isn't. 😊

1. Install node-red-contrib-uibuilder via Node-RED's "Manage palette" menu.

2. Add a new flow consisting of: `inject -> uibuilder -> debug` nodes connected in that order. 
   Add debug nodes to both of the output ports of the uibuilder node and set them both to show the full msg.

3. Double-click on the uibuilder node and change it's URL to `uibtest`. Click on the "Done" button.

4. Click on the Node-RED "Deploy" button.
   
**At this point, you now have a working web app!** The rest is testing.

1. Re-open the uibuilder node and click on the "Open uibtest" button.
   
   This opens a new browser tab showing you your very uninteresting web page.

2. Exit the uibuilder node's configuration panel and click on the inject node's input. 
   Then check your web page again.
   
   You should now see a nicely formatted presentation of the message that the inject node sent to the uibuilder node which, in turn, passed it to your front-end client (the browser).

   _So at this point, you know that you can communicate from Node-RED to your browser. If this isn't working, please see the troubleshooting section below._

3. Now check the debug panel in Node-RED.
   
   You should see several messages listed there. If you check, you will see that they all come from the second output port of the uibuilder node.

   That port outputs uibuilder _control_ messages. The messages tell you where they came from, either the server (the uibuilder node itself) or the client and what they represent ("Client Connect" and "Ready for Content").
   You will also see a property called `cacheControl` with a value of "REPLAY". This can be wired back to the uibuilder input and used to send cached data when a new client connects 
   (or an existing client reloads the page).

   Note that the top output port on the uibuilder node outputs messages from your client(s). There is a helper function in the `uibuilderfe` library: `uibuilder.send({...})` that sends a message back to Node-RED. The message must be structured the same as a Node-RED message. That is to say that it must be a JavaScript object containing properties with values. For example: `{ "payload": "Message from the client", "topic": "mymessage" }`. See below for more information on working with the front-end code.

   Remember that the Node-RED server and the browser client page run in completely separate contexts (even if they both run on the same device). The only communication between them
   happens because the uibuilder node talks to the `uibuilderfe.js` library that you will see in a moment is loaded in your HTML file.

You now have a fully working uibuilder configuration. However, it doesn't do anything useful.

## Finding and editing your front-end code

Now that you have the basics running, it is time to look at the front-end code. The important points to remember are:

* The code is completely standard web code using HTML, CSS and JavaScript (and any libraries you might choose to use).
* There is a JavaScript helper library `uibuilderfe.js` that provides the magic connections between the front and back ends. See the technical docs for more information. A second library called `socket.io` or `socket.io-client` is also needed in order to enable the communications.
* All of the front-end code for a uibuilder node instance is stored in a single folder (with some pre-defined and any desired sub-folders).

There are two ways to look at and change the content of an instance's root folder (which, remember, sits on the Node-RED server).

1. Use the built-in "Edit Files" button in the uibuilder Editor panel.
   
   This is best for quick edits and maybe if your server is remote and you do not have easy access to files on it normally.
   However, it is not the best experience as your code starts to get longer and it does not let you keep multiple files
   open.

   1. Click on the "Edit Files" button
   2. Select a file to edit from the drop-down. Noting that you can also change which folder to look in. 
      The folder called "root" is the root folder for this node instance and should contain a `package.json` file, `src` and `dist` folders.
      The folder called `src` will be the one you will most commonly use unless you are using a more complex template and framework such as Svelte.

      See the [web-app workflow](web-app-workflow#code-folders) documentation for more details about the instance folders, what they mean and how to make use of them.

   3. In the `index.html` file, change the the line that says `<h1>uibuilder Blank Template</h1>` to `<h1>My Data-Driven Web App</h1>`.
   4. Click the "Save" button.
   5. Reload the web page and see that the title has changed.
   6. Now click on the "Reload connected clients on save" button in the Editor. Make another change to the HTML, click save and note that the page auto-reloads.

2. Use a code editor.

   This is best if you are already familiar with writing code for the browser. It is also best if your code is going to be at all complex.

   To use this approach, you need access to the folder on the server's filing system that contains the root folder for the instance.

   Typically, all of the instance folders live in the `<uibRoot>` folder. This is at `~/.node-red/uibuilder` (where `~` is the root folder of the user ID that runs Node-RED).
   However, this may be different if you have turned on Node-RED's projects feature. You can also move the `<uibRoot>` folder using a setting in Node-RED's `settings.js` file.

   Each uibuilder node instance has a URL setting. This has to be unique for the instance of Node-RED and it is used as the identifier for the instance. That includes the folder
   that contains the front-end code. For example, if you use the URL from the first part of the walkthrough, the folder would be `~/.node-red/uibuilder/uibtest/`.

   Editing your code and the tools to use are beyond this walkthrough.

## Choosing a template

Now that you know where things are, you can decide whether you want to completely do the coding yourself or if you would like some basics from a _Template_.

A uibuilder Template is the complete front-end folder for an instance. It contains a `package.json` file in the root and at least a `src` sub-folder containing `index.html` and `index.js`.

There are a few built-in templates that you can select from along with an option to load templates from GitHub repositories.
The default "Blank" template uses no front-end framework, it is pure HTML/JavaScript and shows how you can still use the `uibuilderfe` library.

To change templates - firstly note that changing templates with **_completely wipe any existing code_** from the instance folder. So if you want to keep that, either duplicate your current uibuilder flow (don't forget to change the URL before deploying), create a new flow or make a copy of the instance folder.

The second thing to note is that some of the templates require 3rd-party packages to be pre-installed. Currently, most of the templates require `vue` (VueJS) and `bootstrap-vue`. You need to install these using uibuilder's package manager. See the next section for more information about that.

In this walkthrough, we assume that you will want VueJS and Bootstrap-Vue.

Installing the libraries:

1. Open the uibuilder Editor panel.
2. Click on the "Manage front-end libraries" button.
3. Click on the "+ add" button.
4. Typw "vue" (without the quotes) into the input box
5. Click on the "Install" button.
6. Wait for the confirmation message that tells you the installation is successful.
7. Click the "Close Library Manager" button.
8. Click "Done".
9. Click the "Deploy" button.

Changing templates:

1. Open the uibuilder Editor panel.
2. Click on the "Template Settings" title.
3. Choose a template from the drop-down.
4. If choosing an external template, enter the name as instructed.
5. Click on the "Load & Overwrite" button.
6. Click on the "OK, overwrite" button in the warning dialog. Note that you can cancel up to this point and nothing will be harmed.
7. Reload your web page to see the new page template.

Notes:

* When you reload the web page, any existing data is lost (unless you wrote some custom code to save things in the browser).
  See the examples and wIKI entries about "Caching" to see how to pre-load data into new/reloaded pages.

* The various templates along with some of the examples show you the different ways to work with the `uibuilderfe` 
  library depending whether you are using a front-end framework library or not.

* There is an external template on GitHub called [`TotallyInformation/uib-template-test`](https://github.com/TotallyInformation/uib-template-test).
  You can use this to see the kinds of things that need to be in a template. Templates are likely to continue to evolve and in the future are likely
  to gain a standard way to have an example flow, include build-steps and more. By all means, create your own templates and share them with the community.

## Displaying data from Node-RED

Hi, much easier. You don't really want to send HTML to the front-end if you can help it. Much better to send the data you need. So no need for any template nodes at all.

Send the data in 1 or more standard messages from Node-RED. The uibuilder node sends the whole msg to your front-end.

In your front-end code, you need a uibuilder.onChange('msg', function(msg){...}). Inside the function, take the contents of the msg and assign it to variables that you have pre-defined in your Vue app data section so that they are responsive.

You use the responsive variables in your Vue HTML. Lots of tutorials on using Vue so have a look at some of those if you've not used it before. The only difference with uibuilder is the onChange function which is your link from Node-RED.

## Sending data to Node-RED

To send data back to Node-RED, use the uibuilder.send(msg) function. It pops out of the top output port of the uibuilder node.

## Troubleshooting

### Software versions

uibuilder v4 requires Node.js v12+, Node-RED v 1.3+ and for the browser, an ES6 (ECMA2015) capable version (Not IE. Virtually all modern browsers over the last few years but for Apple mobiles has to be iOS 12+).

Without these, you are likely to hit issues with compatibility or outright error. Please contact the author if you need something outside of these specifications though as it is possible that something could be put together.

[This page](https://www.w3schools.com/js/js_versions.asp) shows which browsers support which versions of JavaScript.

For the VueJS templates and examples, VueJS v2 (not v3) needs to be installed along with the `bootstrap-vue` package.

### A white page

This usually indicates that an error has crashed whatever front-end framework you are using. In the browser, open the Developer Tools and look at the Console tab for errors.

### An ugly page

Assuming you didn't design your page that way, this generally means that you have made an error in one of the URL's in your `index.html` page and so a resource file hasn't loaded. Check the Developer Tools Console and Network tabs for "404" errors (page not found).

Check uibuilder's "uibuilder details" page (button on any uibuilder node in the Editor) to see the exact URL's you should be specifying.