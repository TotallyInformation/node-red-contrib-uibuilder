/** Internal Markdown utilities for uibuilder - bundles marked and front-matter
 * Re-exports dependencies for use in production without adding to main package.json
 */

import { marked } from 'marked'
import fm from 'front-matter'

export {
    marked,
    fm,
}
