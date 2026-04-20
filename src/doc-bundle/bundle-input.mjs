/* eslint-disable n/no-unpublished-import */
/** Import docsify and all required plugins for ESBUILD to bundle
 * NB: This is NOT really an ES Module, the import is interpreted by ESBUILD.
 */
import 'docsify/lib/docsify.js'
import 'docsify/lib/plugins/front-matter.js'
import 'docsify/lib/plugins/search.js'
import 'docsify-darklight-theme/dist/docsify-themeable/main.min.js'
import 'docsify-darklight-theme/dist/docsify-themeable/index.min.js'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-nginx.js'
import 'docsify-pagination/dist/docsify-pagination.js'
import 'docsify-plugin-flexible-alerts/dist/docsify-plugin-flexible-alerts.js'
import 'docsify-copy-code/dist/docsify-copy-code.js'
// import 'docsify-plugin-toc/dist/docsify-plugin-toc.js'
import 'docsify-plugin-toc/src/index.js'
import 'docsify-mermaid/dist/docsify-mermaid.js'

// NB: mermaid must be loaded BEFORE docsify, so it's in a separate bundle. See mermaid-input.mjs

const version = '2026-02-12'
console.log(`uibuilder docsify app.js - version: ${version}`)

/** Don't load CSS into an app.css bundle because, in this case
 *  we need to be able to specify alternate style sheets for light/dark modes.
 *  So we need separate outputs. See build.js for how.
 */
// import 'docsify-darklight-theme/dist/docsify-themeable/style.css'
// import 'docsify-themeable/dist/css/theme-simple.css'
// import 'docsify-themeable/dist/css/theme-simple-dark.css'
