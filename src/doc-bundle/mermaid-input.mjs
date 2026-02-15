/* eslint-disable n/no-unpublished-import */
/** Import mermaid for ESBUILD to bundle because mermaid must be loaded BEFORE docsify
 * NB: This is NOT really an ES Module, the import is interpreted by ESBUILD.
 */
import mermaid from 'mermaid/dist/mermaid.esm.mjs'
window['mermaid'] = mermaid

const version = '2026-02-12'
console.log(`uibuilder docsify mermaid.js - version: ${version}`)
