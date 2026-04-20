/** Internal Filing System utilities for uibuilder - bundles chokidar
 * Re-exports dependencies for use in production without adding to main package.json
 */

import chokidar from 'chokidar'
import fg from 'fast-glob'
import fsextra from 'fs-extra/esm'

export {
    chokidar,
    fg,
    fsextra,
}
