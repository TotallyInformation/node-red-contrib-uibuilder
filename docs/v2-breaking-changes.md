This page aims to document all of the breaking and potentially breaking changes in v2.0.0 since v1.2.6.

While this may seem like a lot of breaking changes. In reality it breaks down to just a few and you only need to do them on existing installations that you have altered from the defaults.

## Configuration

Changes to the way that uibuilder is configured that may require you to update your own configuration.

### No more settings files!

Neither the old settings in `<userDir>/settings.js` nor the "new" ones in `<uibRoot>/.settings.json` are needed any more. 

_This greatly simplifies configuration_.

### Managing front-end library packages

Many front-end library packages are now auto-discovered: vue, bootstrap, bootstrap-vue, jquery, moonjs, reactjs, riot, angular, picnic, umbrellajs

Packages that are not auto-discovered must now be installed using the node's admin UI.

***If you previously had a package installed and configured (via `settings.js`) that isn't in the list above, you will need to "reinstall" it via the admin UI.*** This won't actually reinstall but will make the configuration fall into line.

### New URI path available `../uibuilder/common/`

This is used to serve your own common resources (available to all instances of uibuilder). 

It maps to the `<uibRoot>/common` folder which is created if it doesn't exist.

Unfortunately, you cannot *yet* edit files in here from the admin ui.

### Node-RED's middleware no longer used

`httpNodeMiddleware` in `<userDir>/settings.js` Used by Node-RED's core http-in node.

Middleware is mostly used for security processes to be added into the web server processing (e.g. JWT).

Previously, uibuilder would make use both of the middleware defined in `httpNodeMiddleware` and its own middleware defined in the uibuilder section of `settings.js`. Neither of these are now available.

This is now replaced by ...TBC - this is one of the last parts I need to finish...

### Front-end library packages only loaded once

When you load up a 3rd-party (vendor) npm package such as REACT, VueJS, etc. deployed to `<userDir>/node_modules`. Each is made available to your front-end code via the Node-RED web server.

This used to be done for every instance of a uibuilder node which wasn't terribly efficient if you use many of them. This is now only done once.

The main impact is a change to the URL's used by your front-end code.

Whereas you previously used something like: `<link rel="stylesheet" href="./vendor/normalize.css/normalize.css">`

You now need to use: `<link rel="stylesheet" href="../uibuilder/vendor/normalize.css/normalize.css">` (note the double leading dots)

Script links need to change similarly.

Any link that started like `./vendor` must be changed to `../uibuilder/vendor`.

Using this new URL format avoids any issues with the Node-RED setting `httpNodeRoot` which alters the URL path for non-admin resources.

### Socket.io client library URL has changed

Socket.io client URL now matches the pattern for all other vendor libraries: ***`../uibuilder/vendor/socket.io/socket.io.js`*** (/vendor added).

You will need to ***change your `index.html`*** file and any others you have defined.

All vendor packages deployed to `userDir/node_modules` and made available by uibuilder are now served using the same pattern: `../uibuilder/vendor/<moduleName>/`.

### Minimum supported version of Node.JS

The minimum supported version of Node.JS is now v8.5

uibuilder Node.js programming makes increasing use of ES6 features available after Node.js v8.5.

Note that all front-end code including `uibuilder.html` (the admin ui) and `uibuilderfe.js` (the front-end library) using ES5 only in order to retain maximum compatibility with browsers.

### Server logging/debugging

Detailed logging of uibuilder on the Node-RED server should rarely be needed any more. So all of the settings have been removed and you can delete any log files.

There are plenty of log outputs however still in the code but no interface to turn on logging any more.

Set Node-RED's logging level to `debug` or `trace` to see detailed logging.

### Front-end message trace variables

Previously, it was quite hard to trace incoming/outgoing messages in your front-end code, especially the difference between control and standard messages.

The variable `sentMsg` (`uibuilder.get('sentMsg')`)now only contains a copy of the last standard message sent back to the Node-RED server. `sentCtrlMsg` is a new variable that contains a copy of the last control message sent.

In addition, the variable `msgsSentCtrl` is now actually being updated.

This has a knock-on impact to the default `index.js` file.

You will need to change the 

### Server file locations

If using Node-RED's "projects" feature, each project now gets its own `uibuilder` folder. 

Without projects, this is located at `<userDir>/uibuilder/`. 

With projects, it will not be located at `<userDir>/projects/<projectName>/uibuilder/`. 

**This location will now be referred to as `<uibRoot>`**. See below for other files and folders that have been moved to `<uibRoot>`.

### Default Front-end template code has changed

The default templates have changed from jQuery+normalize.css to VueJS+bootstrap-vue. 

Vue, bootstrap and bootstrap-vue are automatically installed for you.

You may remove the jQuery and normalize.css packages if you aren't using them for anything else (removing jQuery from `<userDir>` does *not* impact the admin ui which also uses it).

To get the new code, make sure that the appropriate flag is set in advanced settings in the admin UI then delete the `index.html`, `index.js` and `index.css` files. Alternatively, just rename them. The new files will be copied over into the correct folder.

### The uibuilder front-end no longer self-starts

In previous versions, the uibuilder front-end library (`uibuilderfe.js`) self-started itself.

While this made its use very simple, it did add one critical limitation. Once communications between your front-end and Node-RED started, you couldn't change the path. 

This meant that it was impossible to server a uibuilder front-end page from a different server or even to use a sub-folder in the node's `src` code folder.

Now, you have to start the library manually using:

```javascript
uibuilder.start()
```

But if you want to have a web page in a sub-folder, you will need to call it like this:

```javascript
uibuilder.start(namespace. ioPath)
```

The namespace will be something like `<httpNodeRoot>/<uibUrl>`.

The ioPath will be something like `/<httpNodeRoot>/uibuilder/vendor/socket.io`

You can find these out by looking at a normal, default uibuilder page or by looking  at the details admin page which is accessible from the admin ui for any uibuilder node under the "Path & Module Details" section.

To serve a uibuilder page from a different web server, in addition to the change above, simply load the socket.io client from the one provided by uibuilder. (**NOTE** not yet tested, sorry).