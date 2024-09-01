---
title: Server-side Rendered Views
description: |
  Automating "page" views on the server using ExpressJS's `views` feature.
created: 2024-03-23 16:12:59
updated: 2024-03-23 16:38:38
---

Not complete.

## Setup

You must manually install a suitable ExpressJS view engine before use.

```bash
cd ~/.node-red
npm install ejs
```

## Configuration

Use the `uibuilder.serverOptions` section of `settings.js` to configure server-side rendered views.

```js
// You need at least a `port` setting to turn on the custom
// server which is required for views

/** Custom settings for all uibuilder node instances */
uibuilder: {
    /** Optional HTTP PORT.
     * If set and different to Node-RED's uiPort, uibuilder will create
     * a separate webserver for its own use.
     */
    port: process.env.UIBPORT || 3001,

    /** Only used if a custom ExpressJS server in use (see port above)
     * Optional: Default will be the same as Node-RED. @type {('http'|'https')}
     */
    customType: 'http',

    /** Optional: Custom ExpressJS server options
     *  Only required if using a custom webserver (see port setting above).
     * For a full list of available options, refer to http://expressjs.com/en/api.html#app.settings.table
     */
    serverOptions: {
        // http://expressjs.com/en/api.html#trust.proxy.options.table
        'trust proxy': true,  // true/false; or subnet(s) to trust; or custom function returning true/false. default=false
        /** Optional view engine - the engine must be installed into your userDir (e.g. where this file lives)
         * If set as shown, ExpressJS will translate source files ending in .ejs to HTML.
         * See https://expressjs.com/en/guide/using-template-engines.html for details.
         */
        'view engine': 'ejs',
        // Optional global settings for view engine
        'view options': {},
        'x-powered-by': false,

        // Custom properties: can be used as vars in view templates
        'footon': 'bar stool',
    },

},
```

By default, the folder used for holding view files is `<uibRoot>/views`. You can change that using the view options shown above.

### Use

Server-side rendered pages need to be made available via manual routes. You can do this using UIBUILDER's ExpressJS middleware feature. [Ref1](uib-configuration#ltuibrootgtconfiguibmiddlewarejs).

> [!NOTE]
> You can set global variables for use in your views using custom ExpressJS properties. See the settings above.

### Instance-level Views

If you want specific views at an instance level, you can use the [Instance-specific API](how-to/instance-apis) feature.
