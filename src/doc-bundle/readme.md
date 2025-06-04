The `build.js` script runs ESBUILD processes to build out docsify and the plugins used in the uibuilder documentation.

The point being to create a stand-alone bundle that will be usable from Node-RED even if working without access to the Internet.

The `build.js` script is run by the `npm run buildDocBundle` command.

It uses the `bundle-input.js` file to define the input and output files for the ESBUILD processes.

Referenced plugins must be npm installed as dev dependencies in the `package.json` file.
