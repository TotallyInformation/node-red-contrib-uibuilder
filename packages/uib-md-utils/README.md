# uib-md-utils

This is a private utility package for uibuilder that bundles libraries for Markdown processing.

## Usage

It can be used both as a CommonJS module (`index.cjs`) and as an ES module (`index.mjs`).

```js
// CommonJS
const { marked, fm } = require('@totallyinformation/uib-md-utils')

// ESM
import { marked, fm } from '@totallyinformation/uib-md-utils'
```

## Updating dependencies

To update the bundled dependencies, run the build script:

```sh
npm run build --workspace=@totallyinformation/uib-md-utils
```

This will use ESBuild to bundle the libraries into single files for both CommonJS and ES module formats.
