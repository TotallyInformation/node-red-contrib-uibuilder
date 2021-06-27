---
title: How-to configure and use a front-end build step using Snowpack
description: >
   Describes how to use Snowpack to build your front-end code.
created: 2021-04-22 09:53:00
lastUpdated: 2021-06-27 17:39:08
---

Status: **Incomplete**

Snowpack's development server does not dynamically update the build directory and so does not directly integrate with uibuilder. You can still use Snowpack to package code for uibulder however.

See the general [Front-end Builds page](./front-end-builds.md) for background information on what a build step is and what tools you might want.

This page covers the installation and configuraiton of the [Snowpack](https://www.snowpack.dev/) build tool to use with uibuilder.

**Important note**: This how-to may use the command-line. When it does, it is assuming that the starting folder
is the root of your uibuilder project on your Node-RED server. For example, if you have a uibuilder node with
a URL set to `myapp`, your start folder is likely to be something like `~/.node-red/uibuilder/myapp`.

Make sure you have a package.json file
Install Snowpack
Install Vue plugin - `npm install --save-dev @snowpack/plugin-vue`
Run `npx snowpack init`
Note that you have to use npx to run snowpack when it is installed locally as recommended. Alternatively, you can set up an npm script in your package.json file, in that case, you don't need to use npx since npm will know where the snowpack executable exists.


## Default Snowpack config file

`snowpack.config.js`

```js
// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    mount: {
        // Use the ./src folder for source files
        'src': '/'
    },
    plugins: [
        '@snowpack/plugin-vue',
    ],
    packageOptions: {
        /* ... */
    },
    devOptions: {
        /* ... */
    },
    buildOptions: {
        // Use the ./dist folder for build files
        'out': 'dist',
    },
}
```