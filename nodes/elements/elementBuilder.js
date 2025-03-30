/** Defines all no-code elements
 *
 * Copyright (c) 2024-2025 Julian Knight (Totally Information)
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
 * @typedef {import('../../typedefs').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs').runtimeNodeConfig} runtimeNodeConfig
 * @typedef {import('../../typedefs').runtimeNode} runtimeNode
 * @typedef {import('../../typedefs').uibElNode} uibElNode <= uib-element node
 */

// const elements = require('./elements')

module.exports = {
    /** ENTRYPOINT: Create/update the _ui object and retain for replay
     * @param {*} msg incoming msg
     * @param {runtimeNode & uibElNode} node reference to node instance
     */
    buildUi: async function buildUi(msg, node) {

        // Allow combination of msg._ui and this node allowing chaining of the nodes
        if ( msg._ui ) {
            if (!Array.isArray(msg._ui)) msg._ui = [msg._ui]
            node._ui = msg._ui
        } else node._ui = []

        // If no mode specified, we assume the desire is to update (since a removal attempt with nothing to remove is safe)
        // ! TODO This should be replace not update
        if ( !msg.mode ) msg.mode = 'update'

        // If mode is remove, then simply do that and return
        if ( msg.mode === 'delete' || msg.mode === 'remove' ) {
            if (!node.elementId) {
                node.warn('[uib-element:buildUi] Cannot remove element as no HTML ID provided')
                return
            }

            node._ui.push({
                'method': 'removeAll',
                'components': [
                    `#${node.elementId}`,
                ]
            })
            return
        }

        // If no HMTL ID is specified & not deleting & type isn't "title", then always ADD
        if (node.elementtype !== 'title' && !node.elementId) {
            msg.mode = 'add'
        }

        // Otherwise ...

        // Add the outer component which is always a div
        node._ui.push({
            'method': msg.mode === 'add' ? 'add' : 'replace',
            'components': [],
        } )
        let parent = node._ui[node._ui.length - 1]

        // Keep track of the next set of components to add to the hierarchy
        // let nextComponents = node._ui[node._ui.length - 1].components
        // TODO if heading, unshift new component object into nextComponents
        // Get the component array for the actual element we are adding
        // nextComponents = nextComponents[nextComponents.length - 1].components

        // ! What type to process?
        let err = ''
        switch (node.elementtype) {
            case 'article': {
                parent = this.addDiv(parent, node)
                parent = this.addHeading(parent, node)
                err = this.buildArticle(node, msg, parent)
                break
            }

            case 'list':
            case 'ol':
            case 'ul': {
                parent = this.addDiv(parent, node)
                parent = this.addHeading(parent, node)
                err = this.buildUlOlList(node, msg, parent)
                break
            }

            case 'dl': {
                parent = this.addDiv(parent, node)
                parent = this.addHeading(parent, node)
                err = this.buildDlList(node, msg, parent)
                break
            }

            case 'table': {
                parent = this.addDiv(parent, node)
                parent = this.addHeading(parent, node)
                err = this.buildTable(node, msg, parent)
                break
            }

            case 'sform': {
                parent = this.addDiv(parent, node)
                parent = this.addHeading(parent, node)
                err = this.buildSForm(node, msg, parent)
                break
            }

            case 'html': {
                // parent = this.addDiv(parent, node)
                // parent = this.addHeading(parent, node)
                err = this.buildHTML(node, msg, parent, false)
                break
            }

            case 'markdown': {
                // parent = this.addDiv(parent, node)
                // parent = this.addHeading(parent, node)
                err = this.buildHTML(node, msg, parent, true)
                break
            }

            case 'title': {
                // In this case, we do not want a wrapping div
                err = this.buildTitle(node, msg, parent)
                break
            }

            case 'tr': {
                err = this.buildTableRow(node, msg, parent)
                break
            }

            case 'li': {
                err = this.buildUlOlRow(node, msg, parent)
                break
            }

            case 'tag': {
                parent = this.addDiv(parent, node)
                parent = this.addHeading(parent, node)
                err = this.buildTag(node, msg, parent)
                break
            }

            // Unknown type. Issue warning and exit
            default: {
                err = `Type "${node.elementtype}" is unknown. Cannot process.`
                break
            }
        }

        if (err.length > 0) {
            node.error(err, node)
        }
    },

    // ----------------------

    /** Adds a wrapping DIV tag
     * @param {object} parent The parent JSON node that we will add components to
     * @param {runtimeNode & uibElNode} node reference to node instance
     * @returns {object} Reference to new compontents array for next element to be added into
     */
    addDiv: function addDiv(parent, node) {
        if (!parent.components) parent.components = []
        parent.components.push(
            {
                'type': 'div',
                'id': node.elementId,
                'parent': node.parent,
                'position': node.position,
                'attributes': {},
                'components': [],
            },
        )
        return node._ui[node._ui.length - 1].components[0]
    },

    /** Add the element heading if defined
     * @param {object} parent The parent JSON node that we will add components to
     * @param {runtimeNode & uibElNode} node reference to node instance
     * @returns {object} Reference to new compontents array for next element to be added into
     */
    addHeading: function addHeading(parent, node) {
        if (!node.heading) return parent

        const hdId = `${node.elementId}-heading`

        // Add accessibility label
        if (!parent.attributes) parent.attributes = {}
        parent.attributes['aria-labelledby'] = hdId

        if (!parent.components) parent.components = []
        parent.components.push(
            {
                'type': node.headingLevel,
                'id': hdId,
                'slot': node.heading,
                'components': [],
            },
        )

        return parent
    },

    /** Build the UI config instructions for the ARTICLE element
     * @param {runtimeNode & uibElNode} node reference to node instance
     * @param {*} msg The msg data in the custom event
     * @param {object} parent The parent JSON node that we will add components to
     * @returns {string} Error description or empty error string
     */
    buildArticle: function buildArticle(node, msg, parent) {
        const err = ''

        parent.attributes.class = 'box'

        // Add the ol/ul tag
        parent.components.push({
            'type': node.elementtype,
            'slot': node.data,
        })

        return err
    },

    /** Build the UI config instructions for DL LIST elements
     * NB: Row ids all removed since rows might change position
     * @param {runtimeNode & uibElNode} node reference to node instance
     * @param {*} msg The msg data in the custom event
     * @param {object} parent The parent JSON node that we will add components to
     * @returns {string} Error description or empty error string
     */
    buildDlList: function buildDlList(node, msg, parent) {
        // Make sure node.data is an object or an array - if not, force to array
        if (!(Array.isArray(node.data) || node.data.constructor.name === 'Object')) node.data = [node.data]

        const err = ''

        // Add the dl tag
        parent.components.push({
            'type': node.elementtype,
            'components': [],
        })

        // Convenient references
        const listRows = parent.components[parent.components.length - 1].components
        const tbl = node.data

        // Walk through the inbound msg payload (works as both object or array)
        Object.keys(tbl).forEach( (row, i) => {
            // Each DL entry needs two elements - treated as a single row

            // Track the data row offset
            // const rowNum = i + 1

            // Check if we have an object(or array)? If not, make content an array - will output only DT's
            if (!(tbl[row] instanceof Object)) {
                tbl[row] = [tbl[row]]
            }
            // Check if the inner data is an object - if so, convert to key/value array
            if (!Array.isArray(tbl[row])) tbl[row] = Object.entries(tbl[row])[0]

            const listIndex = listRows.push( {
                'type': 'div',
                // 'id': `${node.elementId}-data-R${rowNum}`,
                'attributes': {
                    // NB: Making all indexes 1-based for consistency
                    // 'data-row-index': rowNum,
                    // 'class': ((rowNum) % 2  === 0) ? 'even' : 'odd'
                },
                'components': [],
            } )
            // Add a row name attrib from the object key if the input is an object
            if ( node.data !== null && node.data.constructor.name === 'Object' ) {
                listRows[listIndex - 1].attributes['data-row-name'] = row
            }

            // If multiple elements, treat the 1st as the term and the rest as definitions.
            // Object.keys(tbl[row]).slice(0,2).forEach( (el,indx) => {
            tbl[row].forEach( (el, indx) => {
                let lType
                if (indx === 0) {
                    lType = 'dt'
                } else {
                    lType = 'dd'
                }

                // If a 3rd-level object, stringify it (an array will stringify itself)
                if ( tbl[row][indx] !== null && tbl[row][indx].constructor.name === 'Object' ) {
                    try {
                        tbl[row][indx] = JSON.stringify(tbl[row][indx])
                    } catch (e) { }
                }

                listRows[listIndex - 1].components.push( {
                    'type': lType,
                    'slot': tbl[row][indx],
                } )

            })
        } )

        return err
    },

    /** Build the UI config instructions for the HTML element
     * @param {runtimeNode & uibElNode} node reference to node instance
     * @param {*} msg The msg data in the custom event
     * @param {object} parent The parent JSON node that we will add components to
     * @param {boolean} [md] If true, input is Markdown rather than HTML (MD requires the front-end to have loaded the Markdown-IT library)
     * @returns {string} Error description or empty error string
     */
    buildHTML: function buildHTML(node, msg, parent, md = false) {
        // Must be a string so convert arrays/objects
        let data = node.data
        if (!node.data) data = ''
        else if (Array.isArray(node.data)) data = node.data.join('/n')
        else if ( node.data.constructor.name === 'Object' ) {
            try {
                data = JSON.stringify(node.data)
            } catch (e) {
                data = 'ERROR: Could not parse input data'
            }
        }

        const err = ''

        // No wrapping div at this end - done in the client, so deal with parent/position here
        parent.components.push( {
            'id': node.elementId,
            'type': md === true ? 'div' : node.elementtype,
            'parent': node.parent,
            'position': node.position,
            'slot': md !== true ? data : undefined,
            'slotMarkdown': md === true ? data : undefined,
        } )

        return err
    },

    /** Build the UI config instructions for the SIMPLE FORM element
     * @param {runtimeNode & uibElNode} node reference to node instance
     * @param {*} msg The msg data in the custom event
     * @param {object} parent The parent JSON node that we will add components to
     * @returns {string} Error description or empty error string
     */
    buildSForm: function buildSForm(node, msg, parent) {
        // Make sure node.data is an object or an array - if not, force to array
        if (!(Array.isArray(node.data) || node.data.constructor.name === 'Object')) node.data = [node.data]

        const err = ''

        // Add the form tag
        parent.components.push({
            'type': 'form',
            'id': `form-${node.elementId}`,
            'components': [],
        })

        // Convenient references
        const frmBody = parent.components[parent.components.length - 1]
        const frm = node.data
        let btnCount = 0

        // Walk through the inbound msg payload (works as both object or array)
        Object.keys(frm).forEach( (rowRef, i) => {
            // Data for this row/element of the form: id, type
            const frmRow = frm[rowRef]

            // TODO Check that required properties are present

            // Handle non-input inputs
            let tag = 'input'
            if (frmRow.type === 'textarea') tag = 'textarea'
            else if (frmRow.type === 'select') tag = 'select'

            // Add event handlers
            if (frmRow.type === 'button') {
                // Automatically submit form data on click
                frmRow.onclick = 'uibuilder.eventSend(event)'
            } else if (frmRow.type === 'checkbox') {
                // ! Stupid HTML checkbox input does not set the value attribute!

                frmRow.onchange = 'this.dataset.oldValue=this.value;this.value=this.checked.toString();this.dataset.newValue=this.value'

                if ('value' in frmRow) frmRow.checked = frmRow.value.toString()
                else if ('checked' in frmRow) frmRow.value = frmRow.checked.toString()
                else frmRow.value = 'false'
            } else {
                try {
                    // Tracks old/new values on data attributes for input fields
                    frmRow.onchange = 'this.dataset.newValue = this.value'
                    frmRow.onfocus = 'this.dataset.oldValue = this.value'
                } catch (e) {
                    // Catch edge-case where the form row input is a string (incorrect use of template node to send input data)
                    node.error(`[uib-element:elementBuilder:buildSForm] Failed to add onchange/onfocus. Form incomplete. Check input data. ${e.message}`, e)
                    return
                }
            }

            if (!frmRow.name) frmRow.name = frmRow.id

            // TODO Maybe wrap all buttons in a single row at the end of the form?
            // Create the form row (label and input wrapped in a div)
            const rLen = frmBody.components.push( {
                'type': 'div',
                'components': [], // label and input/form/select/button - 2 for input, 1 for button
                'attributes': {},
            } )
            const row = frmBody.components[rLen - 1]

            if (frmRow.title) row.attributes.title = frmRow.title
            else row.attributes.title = frmRow.title = `Type: ${frmRow.type}`

            if (frmRow.required === true) {
                row.attributes.class = 'required'
                row.attributes.title = frmRow.title = `Required. ${row.attributes.title}`
            }

            if (frmRow.disabled === true) {
                row.attributes.title = frmRow.title = `Disabled. ${row.attributes.title}`
            }

            // Add the row elements
            if (frmRow.type === 'button') {
                btnCount++ // keep track of the number of buttons
                const len = row.components.push({
                    'type': 'button',
                    'attributes': frmRow,
                    'slot': frmRow.label,
                })
                row.components[len - 1].attributes.type = 'button'
            } else {
                row.components.push({
                    'type': 'label',
                    'attributes': {
                        'for': frmRow.id,
                    },
                    'slot': frmRow.label ? frmRow.label : `${frmRow.type}:`,
                })
                const n = row.components.push({
                    'type': tag,
                    'id': frmRow.id,
                    'attributes': frmRow,
                })
                // Dropdown select - add selection options
                if ( frmRow.type === 'select' && 'options' in frmRow ) {
                    row.components[n - 1].components = []
                    frmRow.options.forEach( opt => {
                        row.components[n - 1].components.push({
                            type: 'option',
                            attributes: {
                                value: opt.value,
                                selected: opt.value === frmRow.value ? 'selected' : undefined,
                            },
                            slot: opt.label,
                        })
                    })
                }
            }
        } )

        // If user didn't specify any buttons, add them now.
        if (btnCount < 1) {
            // frmBody.components[frmBody.components.length - 1].components.push({
            frmBody.components.push({
                'type': 'div',
                'attributes': {},
                'components': [
                    {
                        'type': 'button',
                        'id': `${node.elementId}-btn-send`,
                        'attributes': {
                            type: 'button',
                            title: 'Send the form data back to Node-RED',
                            onclick: "uibuilder.eventSend(event)"
                        },
                        // Doing it this way, the click event is not visible in the HTML - not so good for saving the result
                        // 'events': {
                        //     click: 'uibuilder.eventSend'
                        // },
                        'slot': 'Send',
                    },
                    {
                        'type': 'button',
                        'id': `${node.elementId}-btn-reset`,
                        'attributes': {
                            type: 'reset',
                            title: 'Reset the form',
                        },
                        // Not really needed and not visible in the HTML
                        // 'events': {
                        //     click: 'event.srcElement.form.reset'
                        // },
                        'slot': 'Reset',
                    }
                ]
            })
        }

        return err
    },

    /** Build the UI config instructions for the TABLE element
     * NB: Row ids all removed since rows might change position
     * @param {runtimeNode & uibElNode} node reference to node instance
     * @param {*} msg The msg data in the custom event
     * @param {object} parent The parent JSON node that we will add components to
     * @returns {string} Error description or empty error string
     */
    buildTable: function buildTable(node, msg, parent) {
        // Make sure node.data is an object or an array - if not, force to array
        if (!(Array.isArray(node.data) || node.data.constructor.name === 'Object')) node.data = [node.data]

        let cols = []
        const err = ''

        // Add the table and thead/tbody tags
        parent.components.push({
            'type': node.elementtype,
            'id': `${node.elementId}-table`,
            'components': [
                {
                    'type': 'thead',
                    'components': []
                },
                {
                    'type': 'tbody',
                    'components': []
                }
            ],
        })

        // Convenient references
        const thead = parent.components[parent.components.length - 1].components[0]
        const tbody = parent.components[parent.components.length - 1].components[1]
        const tbl = node.data

        // Walk through the inbound msg payload (works as both object or array)
        Object.keys(tbl).forEach( (row, i) => {
            // TODO Allow for msg.cols to be used as override
            // Build the columns from the first set of entries & add the thead
            if (i === 0) {
                // const hdrRowNum = i + 1

                // TODO inp[el] has to be an object
                // TODO check that there are >0 columns

                // Create the header row
                thead.components = [
                    {
                        'type': 'tr',
                        // 'id': `${node.elementId}-head-r${hdrRowNum}`,
                        // 'attributes': {
                        //     'data-hdr-row-index': hdrRowNum,
                        // },
                        'components': []
                    }
                ]

                // TODO Allow override from msg.cols
                // Save the col names
                cols = Object.keys(tbl[row])

                // Build the headings
                cols.forEach( (colName, k) => {
                    const colNum = k + 1
                    thead.components[0].components.push({
                        'type': 'th',
                        // 'id': `${node.elementId}-head-r${hdrRowNum}-c${colNum}`,
                        'attributes': {
                            // 'data-hdr-row-index': hdrRowNum,
                            'data-col-index': colNum,
                            'data-col-name': colName,
                        },
                        'slot': colName
                    })
                } )
            }

            // Track the data row offset
            const rowNum = i + 1

            // Create the data row
            const rLen = tbody.components.push( {
                'type': 'tr',
                // 'id': `${node.elementId}-data-R${rowNum}`,
                'components': [],
                'attributes': {},
            } )
            // // Add the row index attrib and even/odd class
            // tbody.components[rLen - 1].attributes = {
            //     // NB: Making all indexes 1-based for consistency
            //     'data-row-index': rLen,
            //     // 'class': (rLen % 2  === 0) ? 'even' : 'odd'
            // }
            // Add row id class
            tbody.components[rLen - 1].attributes.class = `r${rowNum}`
            // Add a row name attrib from the object key if the input is an object
            if ( node.data !== null && node.data.constructor.name === 'Object' ) {
                tbody.components[rLen - 1].attributes['data-row-name'] = row
            }
            // TODO If tbl is an object - get the row names and apply to data-rowname attrib
            // TODO Allow for class overrides in node

            // Build the columns
            cols.forEach(  (colName, j) => {
                const colNum = j + 1

                tbody.components[rLen - 1].components.push({
                    'type': 'td',
                    // 'id': `${node.elementId}-data-R${rowNum}-C${colNum}`,
                    'attributes': {
                        // 'class': ((rowNum) % 2  === 0) ? 'even' : 'odd',
                        // 'data-row-index': rowNum,
                        // NB: Making all indexes 1-based for consistency
                        'data-col-index': colNum,
                        'data-col-name': colName,
                        'class': `r${rowNum} c${colNum}`,
                    },
                    'slot': tbl[row][colName],
                })
            } )
        } )

        return err
    },

    /** Build the UI config instructions for adding a table row to an existing table
     * NB: Row ids all removed since rows might change position
     * @param {runtimeNode & uibElNode} node reference to node instance
     * @param {*} msg The msg data in the custom event
     * @param {object} parent The parent JSON node that we will add components to
     * @returns {string} Error description or empty error string
     */
    buildTableRow: function buildTableRow(node, msg, parent) {
        // Payload must be an object (col/value pairs)
        // TODO Allow payload to be an array

        const err = ''

        parent.method = 'add'
        const rLen = parent.components.push({
            'type': 'tr',
            'parent': `${node.parent} > table > tbody`,
            'position': node.position,
            'components': [],
        })
        // const rowNum = -10
        Object.keys(node.data).forEach(  (colName, j) => {
            const colNum = j + 1

            parent.components[rLen - 1].components.push({
                'type': 'td',
                'attributes': {
                    'data-col-index': colNum,
                    'data-col-name': colName,
                },
                'slot': node.data[colName],
            })
        } )

        return err
    },

    /** Build the UI config instructions for any HTML/custom tag element
     * @param {runtimeNode & uibElNode} node reference to node instance
     * @param {*} msg The msg data in the custom event
     * @param {object} parent The parent JSON node that we will add components to
     * @returns {string} Error description or empty error string
     */
    buildTag: function buildTag(node, msg, parent) {
        // Must be a string or array/object of strings
        // If array/object, then add LAST entry entry as <div role="doc-subtitle">

        if (!Array.isArray(node.data)) node.data = [node.data]

        let err = ''

        if (node.tag === '') {
            err = 'tag name must be provided'
            return err
        }

        parent.components.push({
            'type': node.tag,
            'slot': node.data[0]
        })

        // parent.components.push({
        //     'type': 'h1',
        //     'selector': 'h1',
        //     'parent': node.parent ? node.parent : 'body',
        //     'position': 'first',
        //     'attributes': {
        //         'class': 'with-subtitle',
        //     },
        //     'slot': node.data.shift(),
        // })

        // if (node.data.length > 0) {
        //     node.data.forEach( (element, i) => {
        //         parent.components.push({
        //             'type': 'div',
        //             'selector': 'div[role="doc-subtitle"] ',
        //             'parent': node.parent ? node.parent : 'body',
        //             'position': 'last',
        //             'attributes': {
        //                 'role': 'doc-subtitle',
        //             },
        //             'slot': element,
        //         })
        //     } )
        // }

        return err
    },

    /** Build the UI config instructions for the Title and leading H1
     * @param {runtimeNode & uibElNode} node reference to node instance
     * @param {*} msg The msg data in the custom event
     * @param {object} parent The parent JSON node that we will add components to
     * @returns {string} Error description or empty error string
     */
    buildTitle: function buildTitle(node, msg, parent) {
        // Must be a string or array/object of strings
        // If array/object, then add LAST entry entry as <div role="doc-subtitle">

        if (!Array.isArray(node.data)) node.data = [node.data]

        const err = ''

        parent.components.push({
            'type': 'title',
            // title tags can appear in SVGs as well so limit this
            'selector': 'head title',
            'slot': node.data[0]
        })

        parent.components.push({
            'type': 'h1',
            'selector': 'h1',
            'parent': node.parent ? node.parent : 'body',
            'position': 'first',
            'attributes': {
                'class': 'with-subtitle',
            },
            'slot': node.data.shift(),
        })

        if (node.data.length > 0) {
            node.data.forEach( (element, i) => {
                parent.components.push({
                    'type': 'div',
                    'selector': 'div[role="doc-subtitle"] ',
                    'parent': node.parent ? node.parent : 'body',
                    'position': 'last',
                    'attributes': {
                        'role': 'doc-subtitle',
                    },
                    'slot': element,
                })
            } )
        }

        return err
    },

    /** Build the UI config instructions for the UL or OL LIST elements
     * NB: Row ids all removed since rows might change position
     * @param {runtimeNode & uibElNode} node reference to node instance
     * @param {*} msg The msg data in the custom event
     * @param {object} parent The parent JSON node that we will add components to
     * @returns {string} Error description or empty error string
     */
    buildUlOlList: function buildUlOlList(node, msg, parent) {
        // Make sure node.data is an object or an array - if not, force to array
        if (!(Array.isArray(node.data) || node.data.constructor.name === 'Object')) node.data = [node.data]

        const err = ''

        // Add the ol/ul tag
        parent.components.push({
            'type': node.elementtype,
            'components': [],
        })

        // Convenient references
        const listRows = parent.components[parent.components.length - 1].components
        const tbl = node.data

        // Walk through the inbound msg payload (works as both object or array)
        Object.keys(tbl).forEach( (row, i) => {
            // Track the data row offset
            // const rowNum = i + 1

            // Create next list row
            listRows.push( {
                'type': 'li',
                // 'id': `${node.elementId}-data-R${rowNum}`,
                'attributes': {
                    // NB: Making all indexes 1-based for consistency
                    // 'data-row-index': rowNum,
                    // 'class': ((rowNum) % 2  === 0) ? 'even' : 'odd'
                },
                'slot': tbl[row]
            } )
            // Add a row name attrib from the object key if the input is an object
            if ( node.data !== null && node.data.constructor.name === 'Object' ) {
                listRows[i].attributes['data-row-name'] = row
            }
        } )

        return err
    },

    /** Build the UI config instructions for adding a table row to an existing table
     * NB: Row ids all removed since rows might change position
     * @param {runtimeNode & uibElNode} node reference to node instance
     * @param {*} msg The msg data in the custom event
     * @param {object} parent The parent JSON node that we will add components to
     * @returns {string} Error description or empty error string
     */
    buildUlOlRow: function buildUlOlRow(node, msg, parent) {
        // Payload must be a a string
        if ( !Array.isArray(node.data) ) node.data = [node.data]

        const err = ''

        parent.method = 'add'

        // const rowNum = -10
        Object.keys(node.data).forEach(  (rowName, j) => {
            parent.components.push({
                'type': 'li',
                'parent': `${node.parent} > ul`,
                'position': node.position,
                // 'attributes': {
                //     'data-row-name': rowName,
                // },
                'slot': node.data[j],
            })
        } )

        return err
    },
}
