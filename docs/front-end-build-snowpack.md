---
title: How-to configure and use a front-end build step using Snowpack
description: >
   Describes how to use Snowpack to build your front-end code.
created: 2021-04-22 09:53:00
lastUpdated: 2022-02-05 21:19:50
---

Status: **Incomplete**

Snowpack's development server does not dynamically update the build directory and so does not directly integrate with uibuilder. You can still use Snowpack to package code for uibulder however.

See the general [Front-end Builds page](./front-end-builds.md) for background information on what a build step is and what tools you might want.

This page covers the installation and configuration of the [Snowpack](https://www.snowpack.dev/) build tool to use with uibuilder.

**Important note**: This how-to may use the command-line. When it does, it is assuming that the starting folder
is the root of your uibuilder project on your Node-RED server. For example, if you have a uibuilder node with
a URL set to `myapp`, your start folder is likely to be something like `~/.node-red/uibuilder/myapp`.

Make sure you have a package.json file (run `npm init -y` if not), then:

1. Install Snowpack
2. Install the Vue or other plugin's as needed - `npm install --save-dev @snowpack/plugin-vue`
3. Run `npx snowpack init`
4. Configure your snowpack configuration file as shown below.
5. Run `npx snowpack dev` to use the development server (don't forget to change the .html links and the uibuilder.start namespace). Or, run `npx snowpack build` to update the `dist` folder ready for use.

Note that you have to use npx to run snowpack when it is installed locally as recommended. Alternatively, you can set up an npm script in your package.json file, in that case, you don't need to use npx since npm will know where the snowpack executable exists.

Don't forget to change the uibuilder node's advanced settings to use the `dist` folder once you have built your code.

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
        '@snowpack/plugin-vue', // Only if using VueJS
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