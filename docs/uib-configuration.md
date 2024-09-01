---
title: Configuring UIBUILDER
description: |
  Describes how to change UIBUILDER's configuration, options and settings.
created: 2021-12-30 17:38:33
updated: 2024-03-24 21:31:48
---

> [!NOTE]
> This page is about the global configuration of UIBUILDER. If you are looking for information on how to configure an individual `uibuilder` node instance, please refer to the [Configuring `uibuilder` nodes](uib-node-configuration.md) page. 

UIBUILDER is configured in a number of places.

Obviously, each node instance you add to your flows has its own configuration which is set in the Node-RED Editor by double-
clicking on the node.

However, there are some additional places you may need to make changes to.

- [`settings.js`](#settingsjs)
- [`<uibRoot>/.config/`](#uibrootconfig)
- [`<uibRoot>/<instance-url>/`](#uibrootinstance-url)

* **`settings.js`** - may optionally have a property called `uibuilder` with a number of settings that are global to
  all `uibuilder` nodes.

* **`<uibRoot>/.config/`** - contains a number of files that are global to all instances of `uibuilder` nodes.

* **`uibRoot>/<instance-url>/`** - contains the settings, build modules and front-end code for the specific instance
  of `uibuilder` nodes.

## `settings.js`

This file contains the global settings for Node-RED. You can add a new property to it called `uibuilder` as in the following example that describes all of the current options.

```js
   /** Custom settings for all uibuilder node instances */
   uibuilder: {
        /** Optional HTTP PORT. Required for custom server.
         * If set and different to Node-RED's uiPort, uibuilder will create
         * a separate webserver for its own use.
         */
        port: process.env.UIBPORT || 3001,

        /** Optional: Change location of uibRoot
         * If set, instead of something like `~/.node-red/uibuilder`, the 
         * uibRoot folder can be anywhere you like.
         */
        uibRoot: process.env.UIBROOT || path.join(os.homedir(), 'myuibroot'),
        
        /** Only used if a custom ExpressJS server in use (see port above)
         * Optional: Default will be the same as Node-RED. 
         * @type {('http'|'https')} 
         */
        customType: 'http',
        
        /** Only required if type is https, http2. Defines the cert & key. 
         * See Node-RED https settings for more details.
         * @type {Object<Buffer,Buffer>}
         */
        // https: {
        //     key: 'keyname.key',
        //     cert: 'fullchain.cer'
        // },
        
        /** Optional: Custom ExpressJS server options
         *  Only required if using a custom webserver (see port setting above). 
         * For a full list of available options, refer to
         *   http://expressjs.com/en/api.html#app.settings.table
         */
        serverOptions: {
            // If you want to turn off URL case sensitivity
            // 'case sensitive routing': false,
            
            // http://expressjs.com/en/api.html#trust.proxy.options.table
            // true/false; or subnet(s) to trust; or custom function 
            //   returning true/false. default=false
            'trust proxy': true,
            
            /** Optional view engine - the engine must be installed into 
             *  your userDir (e.g. where this file lives)
             * If set as shown, ExpressJS will translate source files ending
             * in .ejs to HTML.
             * See https://expressjs.com/en/guide/using-template-engines.html
             */
            'view engine': 'ejs',
            // Optional global settings for view engine
            'view options': {},

            // Custom properties: can be used as vars in view templates
            'footon': 'bar stool',
        },

        /** Optional: Socket.IO Server Options. 
         * See https://socket.io/docs/v4/server-options/
         * Note that the `path` property will be ignored, it is set by 
         * uibuilder itself. You can set any other setting, though you 
         * might break uibuilder unless you know what you are doing.
         * @type {Object}
         */
        // socketOptions: {
        //     // Make the default buffer larger (default=1MB)
        //     maxHttpBufferSize: 1e8 // 100 MB
        // },

        /** Controls whether the uibuilder instance API feature is enabled
         *  Off by default since uncontrolled instance api's are a security and 
         *  operational risk. Use with caution. See Docs for details.
         */
        instanceApiAllowed: true,
   },
```

## `<uibRoot>/.config/`

Master uibuilder configuration files. Created and pre-populated with template examples upon installation.

Note that the example templates end with `.js-template` and that the template files are _always_ overwritten each time Node-RED starts. This ensures that the templates are always the latest versions but avoids overwriting any live files.

### `<uibRoot>/.config/uibMiddleware.js`

ExpressJS middleware, called for all `uibuilder` node instances whenever a client connection is made (for user-facing API calls as well as UI's).

This should be kept as short and efficient as possible since it will be called many times for all client connections.

It may be used to provide custom authentication and authorisation processing if desired or to add/change custom headers, etc.

### `<uibRoot>/.config/sioMiddleware.js`

Per-client-connection server Socket.IO middleware. 

Contains an exported function that is run every time a client (e.g. a uibuilder powered browser tab) connects to the Socket.IO server embedded in a `uibuilder` node. It can be used as part of security processes.

See [Developer documentation for `socket.js`](socket-js.md) for more details.

### `<uibRoot>/.config/sioUse.js`

Per-inbound-message Socket.IO middleware. 

Contains an exported function that is run every time a message is received to any `uibuilder` node from any client browser. The function may make changes to the message and/or block receipt of the message. It can be used as part of security processes.

See [Developer documentation for `socket.js`](socket-js.md) for more details.

### `<uibRoot>/.config/sioMsgOut.js`

Per-outbound-message Socket.IO middleware. 

Contains an exported function that is run every time a message is sent from any `uibuilder` node to any client browser. The function may make changes to the message. It can be used as part of security processes.

See [Developer documentation for `socket.js`](socket-js.md) for more details.

## `<uibRoot>/<instance-url>/`

These folders contain the information for configuring your front-end UI.

Normally, you will expect to see at least the following:

* `src/` - The folder containing the source code that defines your UI. It should _always_ contain at least an `index.html` file. Typically, it will also contain `index.js` and `index.css` files. This folder is the default location presented via the Node-RED web server as `http://node-red-host:1880/<instance-url>/` so anything you put in it will be available via the web server.

* `dist/` - This folder should be used as the target of any "build" process. It will be served instead of the `src` folder if you choose it in the uibuilder advanced options. See the "Svelte Basic" template for a good example.

* `package.json` - This is a fairly standard npm package description file and should describe and name your UI. Strictly speaking it is not currently _required_ (unless you want to push to GitHub as an external tempalte) but may be in the future and should be included. The standard uibuilder templates contain examples. It is good practice to include `"private": true,` to prevent the folder being accidentally published to npm.

   Expect this file to take on more importance in the future. Specifically, the `scripts` section will be used in a future release to let you easily run npm scripts from within the Node-RED Editor. This will be particularly useful for doing builds.

* `README.md` - Useful to include a more detailed description of your UI. Not actually required but certainly good practice. It _is_ required if you decide to push your UI to GitHub to make it available to others as an external template.

* `.eslintrc.js` - Again not strictly required but useful if you are using ESLint to check your code for issues, consistency and quality.

* `api/` - Optional folder. Any `.js` files contained within it will be loaded as instance API's if your configuration allows it. See the [instance API's page](instance-apis.md) for more details.

* `scripts/` - Optional folder. Used for utility scripts that might be needed to help with build processes and the like.

* _`node_modules/` - Not directly part of uibuilder. This folder will exist if you have locally installed any dependencies for this uibuilder instance. Typically, these would be "dev dependencies" defined in the package.json file and used as part of a build process. You do not need to back these up or commit them to a source code repository._
