# uib-md-utils

This is a private utility package for uibuilder that bundles libraries for Markdown processing.

The `src` folder contains the source code, which imports the external libraries and re-exports them. The `index.cjs` and `index.mjs` files are the bundled outputs for CommonJS and ES module formats respectively.

The `build.mjs` script uses ESBuild to bundle the libraries into single files. This means that the `node_modules` folder does not need to be included when publishing or using this package, reducing size and complexity.

## Usage

It can be used both as a CommonJS module (`index.cjs`) or as an ES module (`index.mjs`).

```js
// CommonJS
const { fm, mdParse } = require('@totallyinformation/uib-md-utils')

// ESM
import { fm, mdParse } from '@totallyinformation/uib-md-utils'
```

## Updating dependencies

To update the bundled dependencies, run the build script:

```sh
npm run build --workspace=@totallyinformation/uib-md-utils
```

This will use ESBuild to bundle the libraries into single files for both CommonJS and ES module formats.
