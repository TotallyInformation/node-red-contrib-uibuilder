---
title: Controlled output formats
description: >
  As UIBUILDER gets more complex and needs to work in different server and client environments, it is more important to control JavaScript and CSS output formats and to build minified versions of JavaScript, CSS and even HTML in some cases. This page describes the requirements for the build process and the output formats that are needed to ensure maximum compatibility and performance across different environments.
created: 2023-10-08 15:15:36
updated: 2026-04-21 12:35:51
---

See the code in `gulpfile.js` for the old processes.

## What needs building?

* The front-end client library (src\front-end-module).
* A separate version of the UI library for node.js use.
* Build the front-end router library.
* Build the experimental front-end library.
* The uib-md-utils package.
* The uib-fs-utils package.
* The docs bundle.

## Requirements

### General
* Use ESBUILD to build JavaScript source.
* Do not minify Node.js code to allow for better debugging and error messages.
* Build both ESM and CJS versions of the Node.js code to allow for maximum compatibility.
* Node.js output should use .cjs or .mjs extensions as appropriate to allow for better compatibility and to avoid confusion with ESM modules.
* Build both ESM and IIFE versions of the front-end code to allow for maximum compatibility.
* Output both minified and unminified versions of the front-end code to reduce file sizes and improve performance (e.g. 4 output versions of each library: ESM/min, ESM/unmin, IIFE/min, IIFE/unmin).
* Front-end output should use *.esm.js, *.iife.js, *.esm.min.js and *.iife.min.js extensions to clearly indicate the format and whether it is minified.
* For all minified code, generate source maps to improve debugging and development experience.
* All builds must be included in a watch process that automatically rebuilds the affected code when source files are changed.
* Use LightningCSS to build and minify the CSS for the front-end code, allowing for modern CSS features while still supporting older browsers.
* Use the browserslist library to control the output formats and features based on specified browser support targets.
* Use a defined array variable containing file paths and regular expressions that find the file version string. Such that those files are automatically updated with the correct version during the build process. e.g. `[ {file:'src/front-end-module/ui.js',regex:/version = "(.*)-src"/, type:'semantic'}, ]` where type can be 'semantic' (e.g. v1.2.3) or 'date' (e.g. 2023-10-08). Where the type is 'semantic', the version is taken from the package.json file. Where the type is 'date', the version is generated from the source file's last modified date. This allows for consistent versioning across all output files without needing to manually update version strings in multiple places.
* Required output version support:
  * Node.js 18.(latest) for the Node.js code. Increasing the baseline in-line with the Node-RED baseline (v18 for Node-RED v3, v22 for v4).
  * Browser JavaScript: '>=0.12%, not ie > 0' (from the browserslist-to-esbuild library).
  * Browser CSS: '>=0.12%, not ie > 0' (from browserslist and LightningCSS's browserslistToTargets).

### Build/Watch Script
* MUST be a single script to build and watch.
* SHOULD use node.js and ESBUILD APIs directly rather than a task runner like Gulp to reduce complexity and increase control.
* MAY use the `chokidar` library (from the `uib-fs-utils` package) to watch for file changes and trigger rebuilds if necessary.
* The script MUST use central configuration variables/constants to control the build process, such as source and output directories, build options, etc. This will allow for easier maintenance and updates to the build process in the future.
* The script MUST be well-documented with comments explaining the purpose and functionality of each section of code, as well as any important details about the build process.
* The script MUST be designed to be run from the command line and should provide clear output about the build/watch processes, including any errors or warnings that occur during the build.
* At the start of the script, the current package.json version should be read and stored in a variable to allow for consistent versioning across all output files. The script should output the version being built and the target node-red and node.js versions to the console for clarity.
* The script MUST handle errors gracefully, providing clear error messages and not crashing the entire process if a build fails.
* The script MUST be designed to be easily extendable in the future as new libraries or output formats may need to be added.
* The script MUST be included in the `package.json` scripts section to allow for easy execution with npm commands.
