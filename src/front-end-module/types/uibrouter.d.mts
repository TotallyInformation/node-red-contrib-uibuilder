/**
 * ES Module type binding shim for uibrouter.mjs
 * TypeScript only pairs .mjs files with .d.mts files, this shim re-exports
 * the master type definitions so that imports of uibrouter.mjs
 * pick up correctly in IDEs.
 *
 * The master definitions live in types/uibrouter.d.ts
 *
 * @version 8.0.0-src
 * @author Julian Knight (Totally Information)
 */

export * from './uibrouter.js'
export { UibRouter as default } from './uibrouter.js'
