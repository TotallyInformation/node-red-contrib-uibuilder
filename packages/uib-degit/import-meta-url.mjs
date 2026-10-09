// const import_meta_url = require('url').pathToFileURL(__filename)
// module.exports = import_meta_url

import { pathToFileURL } from 'node:url'
export const import_meta_url = pathToFileURL(__filename).href
