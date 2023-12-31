---
created: 2023-10-21 15:30:26
updated: 2023-12-30 17:01:41
---

## Base data, folders, and files

### Folder: `<userDir>/`

This is usually `~/.node-red/` and is the main folder containing the settings and node packages for Node-RED.

Prior to v5 of uibuilder, this was used to install uibuilder front-end packages. As of v5+, this is no longer the case.

### Folder: `<uibRoot>/`

Needs a package.json file and will contain a `node_modules` folder if any packages are installed for all instances of uibuilder (the default location).

### Folder: `<uibRoot>/<url>/`

This is the local configuration folder for a uibuilder node instance (as defined by the node's `url` setting).

Needs a `package.json` file but currently, packages installed here are only used for processing the front-end code. Normally, you would not see any `dependencies`, only `dev-dependencies` for example Webpack.

## System startup

When the uibuilder module is loaded, it immediately sets up the required web server routes. This includes the front-end library (vendor) routes for any packages installed to `uibRoot`.

```
uibuilder.js[Uib->runtimeSetup]->web.js[setup->_webSetup->serveVendorPackages, serveVendorSocketIo]
```

## Editor

### Open panel for a uibuilder node instance

On opening a uibuilder node configuration panel in the editor:

```
uibuilder.html[oneditprepare->packageList]->admin-api-v2.js[uibvendorpackages]->web.js[serveVendorPackages]

Sets the 'packages' variable.
```

On click on "Libraries" tab:

```
uibuilder.js[tabLibraries->]
```

### Add a new package

### Remove a package

## Internal Variables

You don't need to know these unless you are working on the uibuilder code.

### `uibuilder.js`

#### `packageMgt.uibPackageJson`

Set by the `getUibRootPackageJson` method in `nodes/libs/package-mgt.js`.
It contains the contents of the `<uibRoot>/package.json` file.

The important properties are:

* `dependencies` - the list of installed packages that are served up by uibuilder
* `uibuilder` - Metadata and config data for the uibuilder module.
  
  Specifically `uibuilder.packages` which contains the package metadata:

  ```json
  {
    "vue": {
        "installFolder": "/src/uibRoot/node_modules/vue",
        "installedVersion": "2.6.14",
        "estimatedEntryPoint": "dist/vue.js",
        "homepage": "https://github.com/vuejs/vue#readme",
        "packageUrl": "/vue",
        "url": "../uibuilder/vendor/vue/dist/vue.js",
        "spec": "^2.6.14"
    },
    ....
  }
  ```

### `uibuilder.html`

#### `packages`

Set when panel is opened. See Editor section above.

A copy of the `uibuilder.packages` data shown above.