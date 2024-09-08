/** Defines all no-code elements
 *
 * Copyright (c) 2024-2024 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk, https://github.com/TotallyInformation/node-red-contrib-uibuilder
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

/** --- Type Defs ---
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 */

/** Defines all available no-code elements */
const elements = {
    table: {
        value: 'table',
        label: 'Simple Table',
        allowsParent: true,
        allowsHead: true,
        allowsPos: true,
    },
    sform: {
        value: 'sform',
        label: 'Simple Form',
        allowsParent: true,
        allowsHead: true,
        allowsPos: true,
    },
    ul: {
        value: 'ul',
        label: 'Unordered List (ul)',
        allowsParent: true,
        allowsHead: true,
        allowsPos: true,
    },
    ol: {
        value: 'ol',
        label: 'Ordered List (ol)',
        allowsParent: true,
        allowsHead: true,
        allowsPos: true,
    },
    dl: {
        value: 'dl',
        label: 'Description List (dl)',
        allowsParent: true,
        allowsHead: true,
        allowsPos: true,
    },
    article: {
        value: 'article',
        label: 'Text box',
        allowsParent: true,
        allowsHead: true,
        allowsPos: true,
    },
    html: {
        value: 'html',
        label: 'HTML',
        allowsParent: true,
        allowsHead: false,
        allowsPos: true,
    },
    markdown: {
        value: 'markdown',
        label: 'Markdown',
        allowsParent: true,
        allowsHead: false,
        allowsPos: true,
    },
    title: {
        value: 'title',
        label: 'Page Title',
        allowsParent: false,
        allowsHead: false,
        allowsPos: false,
    },
    li: {
        value: 'li',
        label: 'Add row to existing ordered or unordered list',
        allowsParent: true,
        allowsHead: false,
        allowsPos: true,
    },
    tr: {
        value: 'tr',
        label: 'Add row to existing table',
        allowsParent: true,
        allowsHead: false,
        allowsPos: true,
    },
}

module.exports = elements
