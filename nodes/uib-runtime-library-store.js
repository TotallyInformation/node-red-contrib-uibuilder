/** --- Type Defs ---
 * @typedef {import('../typedefs.js').uibNode} uibNode
 * @typedef {import('../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../typedefs.js').runtimeNodeConfig} runtimeNodeConfig
 * @typedef {import('../typedefs.js').uibConfig} uibConfig
 * @typedef {import('../typedefs.js').uibCustomLogger} uibCustomLogger
 */

const path = require('node:path')

// Will auto-enable if TI_ENV environment variable is set to "debug"
const { /** @type {uibCustomLogger} */ log: clog, } = require('./libs/logger.mjs')
// clog.debug('Loading')
clog.warn('uib-runtime-library-store is EXPERIMENTAL and may not work as expected')

/** Load this first out of the uibuilder-specific libraries. The uibuilder global configuration object, used throughout all nodes and libraries.
 * @type {uibConfig}
 */
const uib = require('./libs/uibGlobalConfig.cjs')
const fslib = require('./libs/fs.cjs') // File/folder handling library (by Totally Information)

module.exports = function (RED) {
    class UibLibraryStore {
        constructor(config) {
            clog.info('>> config', config)
            this.type = 'uib-runtime-library-store'
            this.id = config.id
            this.label = config.label || config.id
            this.readOnly = Boolean(config.readOnly)
            this.path = config.path
            this.endpoint = config.endpoint

            clog.info('>> uib', uib.rootFolder)
        }

        async init() {
            // Connect to API, database, or verify credentials on startup
            clog.info('>> uib 2', uib.rootFolder, this)
        }

        async getEntry(type, path) {
            clog.info('>> get entry', type, path)
            // Return flow/entry contents if 'path' points to an item,
            // or an array of directory/entry objects if 'path' is a folder
            return [
                'one',
                'two'
            ]
        }

        async saveEntry(type, path, meta, body) {
            // Implement when supporting exports into this store
            if (this.readOnly) {
                throw new Error('Library source is read-only')
            }
        }
    }
    clog.info('>> RED.settings.userDir', RED.settings.userDir)
    RED.plugins.registerPlugin('uib-runtime-library-store', {
        type: 'node-red-library-source',
        class: UibLibraryStore,
    })
}

/*
RED.settings.editorTheme?.library?.sources
{ sources: [{ id: 'uibuilder-library', type: 'uib-runtime-library-store', label: 'UIBUILDER', icon: 'font-awesome/fa-cube', },] }
*/
