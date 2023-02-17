/* eslint-disable strict, sonarjs/no-duplicate-string */

// Isolate this code
(function () {
    'use strict'

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName = 'uib-element'
    /** Node's label @constant {string} paletteCategory */
    const nodeLabel = moduleName
    /** Node's palette category @constant {string} paletteCategory */
    const paletteCategory = 'uibuilder'
    /** Node's background color @constant {string} paletteColor */
    const paletteColor = '#E6E0F8'

    /** Element Types definitions */
    const elTypes = {
        table: {
            value: 'table',
            label: 'Simple Table',
            description: `
                <p>
                    A simple but accessible table.
                </p><p>
                    Set the incoming <code>msg.payload</code> to an <i>Array of Objects<i>.
                    Each array entry will be a new row. Each property of the first array entry
                    will be used for the column names.
                </p><p>
                    An Object of Objects can also be used. In that case, the outer object's keys will be
                    used as row names by adding a <code>data-row-name</code> attribute to each row.
                </p><p>
                    Each column in the table has 
                    <code>data-col-index</code> and <code>data-col-name</code> attributes. 
                </p>
            `,
            allowsParent: true,
            parentRequired: false,
            allowsHead: true,
            allowsPos: false,
        },
        ul: {
            value: 'ul',
            label: 'Unordered List (ul)',
            description: `
                <p>
                    Outputs a simple, accessible, bullet list.
                </p><p>
                    Input <code>msg.payload</code> should be an array of strings.
                    An object of key/values can also be used.
                </p>
            `,
            allowsParent: true,
            parentRequired: false,
            allowsHead: true,
            allowsPos: false,
        },
        ol: {
            value: 'ol',
            label: 'Ordered List (ol)',
            description: `
                <p>
                    Outputs a simple, accessible, numbered list
                </p><p>
                    Input <code>msg.payload</code> should be an array of strings.
                    An object of key/values can also be used.
                </p>
            `,
            allowsParent: true,
            parentRequired: false,
            allowsHead: true,
            allowsPos: false,
        },
        dl: {
            value: 'dl',
            label: 'Description List (dl)',
            description: `
                <p>
                    Outputs a simple, accessible, description list.
                </p>
                <p>
                    Set the incoming <code>msg.payload</code> to be an Array of Array's. The outer array representing each row 
                    and the inner array containing at least 2 string entries representing the term/description pair.
                    Additional entries in the inner array are added as secondary descriptions (<code>dd</code> tags).
                </p>
                <p>
                    You can also use an Array of Objects where each object is a simple key/value pair. Or even an Object of Objects.
                    Inner structures are catenated into a string separated by commas.
                </p>
                <p>
                    Each entry has a wrapping <code>&lt;div></code> tag containing a term (<code>dt</code>) 
                    and one or more descriptions (<code>dd</code>).
                </p>
            `,
            allowsParent: true,
            parentRequired: false,
            allowsHead: true,
            allowsPos: false,
        },
        article: {
            value: 'article',
            label: 'Text box',
            description: `
                <p>
                    A simple box containing text with an optional heading.
                </p>
            `,
            allowsParent: true,
            parentRequired: false,
            allowsHead: true,
            allowsPos: false,
        },
        html: {
            value: 'html',
            label: 'HTML',
            description: `
                <p>
                    Pass-through HTML. When sent to the uibuilder node, will be reproduced in your page(s).
                </p>
                <p>
                    May be used with the Node-RED core <code>template</code> node.
                </p>
                <p>
                    <b>NOTE</b>: Use with caution, no validity checking is currently done.
                </p>
            `,
            allowsParent: false,
            parentRequired: false,
            allowsHead: false,
            allowsPos: false,
        },
        title: {
            value: 'title',
            label: 'Page Title',
            description: `
                <p>
                    Updates the HTML page title and meta description. Amends the first <code>&lt;h1></code> tag on the page if it exists else adds one at the top of the page.
                </p>
                <p>
                    <code>msg.payload</code> must be a simple string.
                </p>
            `,
            allowsParent: false,
            parentRequired: false,
            allowsHead: false,
            allowsPos: false,
        },
        li: {
            value: 'li',
            label: 'Add row to existing ordered or unordered list',
            description: `
                <p>
                    Add a new row to an existing list.
                </p><p>
                    Set the <b>Parent</b> to the id of the existing table.
                    The <b>HTML ID</b> can be anything unique to the page.
                </p><p>
                    Set the incoming <code>msg.payload</code> to a string.
                </p><p>
                    Set the <b>Position</b> to "first", "last" or a number.
                </p>
            `,
            allowsParent: true,
            parentRequired: true,
            allowsHead: false,
            allowsPos: true,
        },
        tr: {
            value: 'tr',
            label: 'Add row to existing table',
            description: `
                <p>
                    Add a new row to an existing table.
                </p><p>
                    Set the <b>Parent</b> to the id of the existing table.
                    The <b>HTML ID</b> can be anything unique to the page.
                </p><p>
                    Set the incoming <code>msg.payload</code> to an <i>Object<i>.
                    The properties of the object must match the column definitions of the existing table.
                </p><p>
                    Set the <b>Position</b> to "first", "last" or a number.
                </p>
            `,
            allowsParent: true,
            parentRequired: true,
            allowsHead: false,
            allowsPos: true,
        },
    }

    // TODO Turn off parent & heading inputs where not wanted
    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {
        // Initial conf data
        if (!node.confData) node.confData = {}

        // Define element types for drop-down
        $('#node-input-elementtype').typedInput({
            types: [
                {
                    value: 'elementType',
                    // @ts-expect-error
                    options: Object.values(elTypes)
                }
            ]
        // @ts-ignore On-change of element type, update the info panel
        }).on('change', function() {
            if (elTypes[this.value].description === undefined) elTypes[this.value].description = 'No description available.'
            $('#type-info').html(elTypes[this.value].description)

            if ( elTypes[this.value].allowsParent === false ) $('#node-input-parent').prop('disabled', true)
            else $('#node-input-parent').prop('disabled', false)

            if ( elTypes[this.value].allowsHead === false ) $('#node-input-heading').typedInput('disable')
            else $('#node-input-heading').typedInput('enable')

            if ( elTypes[this.value].allowsPos === false ) $('#node-input-position').prop('disabled', true)
            else $('#node-input-position').prop('disabled', false)
        })

        // Set up optional heading input
        $('#node-input-heading').typedInput({
            typeField: $('#node-input-headingLevel'),
            types: [
                {
                    value: 'h2', label: 'H2: ', hasValue: true,
                },
                {
                    value: 'h3', label: 'H3 ', hasValue: true,
                },
                {
                    value: 'h4', label: 'H4 ', hasValue: true,
                },
                {
                    value: 'h5', label: 'H5 ', hasValue: true,
                },
                {
                    value: 'h6', label: 'H6 ', hasValue: true,
                },
            ]
        }).typedInput('width', '68.5%')

        // Create unique default topic from id
        $('#node-input-elementid').on('change', function() {
            // @ts-expect-error
            $('#node-input-topic').val(this.value)
        })

        // Make position of aria-labels dynamic to cursor
        // $('#uib-el *[aria-label]').on('mousemove', function(event) {
        //     document.documentElement.style.setProperty('--x', event.pageX )
        //     document.documentElement.style.setProperty('--y', event.pageY )
        //     document.documentElement.style.setProperty('--moveX', event.originalEvent.movementX )
        //     document.documentElement.style.setProperty('--moveY', event.originalEvent.movementY )
        //     console.log(event)
        //     // document.documentElement.style.setProperty('--x', event.clientX)
        //     // document.documentElement.style.setProperty('--y', event.clientY)
        //     // $(this).prop('style', `top:${event.pageY}px;left:${event.pageX}`)
        // })

        // TODO reset unused conf props on type change?

        // Delegated event handler for conf data - just marks things as changed
        $('#el-tab-conf').on('change', '[data-uib-el-prop]', function() {
            $(this).attr('data-changed', 'true')
        })

        const tabs = RED.tabs.create({
            id: 'el-tabs',
            // scrollable: true,
            // collapsible: true,
            onchange: function (tab) {
                let templ, docFrag
                $('#el-tabs-content').children().hide()
                // Populate the element config tab based on type
                if ( tab.id === 'el-tab-conf') {
                    const type = $('#node-input-elementtype').val()
                    switch (type) { // eslint-disable-line sonarjs/no-small-switch
                        case 'text': {
                            templ = document.querySelector('#text-template')
                            break
                        }

                        case 'table': {
                            templ = document.querySelector('#table-template')
                            break
                        }

                        case 'list':
                        case 'ol':
                        case 'ul':
                        case 'dl': {
                            templ = document.querySelector('#list-template')
                            break
                        }

                        default: {
                            templ = document.createElement('template')
                            break
                        }
                    }
                    // @ts-ignore - Clone the template and apply to the UI
                    docFrag = templ.content.cloneNode(true)
                    $('#el-tab-conf').append(docFrag)
                    // Get any required functions for this type from the template (append runs the script tags immediately)
                    const confFns = window['uibElementConfigFns']
                    console.log('confFns', confFns.type, confFns)
                    // Re-constitute node.conf properties and values to the conf tab
                    Object.keys(node.confData).forEach( conf => {
                        // TODO Deal with select tags
                        $(`#conf-${type}-${conf}`).val(node.confData[conf])
                    })
                } else {
                    $('#el-tab-conf').empty()
                }
                $('#' + tab.id).show()
            }
        })
        tabs.addTab({
            id: 'el-tab-main',
            label: 'Main'
        })
        tabs.addTab({
            id: 'el-tab-conf',
            label: 'Element Config'
        })

    } // ----- end of onEditPrepare() ----- //

    /** Prep for save
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditSave(node) {
        $('[data-changed="true"]').each(function(i) {
            node.confData[this.dataset.prop] = $(this).val()
            node.changed = true
            RED.nodes.dirty(true)
        })
    } // ----- end of onEditPrepare() ----- //

    // @ts-ignore
    RED.nodes.registerType(moduleName, {
        category: paletteCategory,
        color: paletteColor,
        defaults: {
            name: { value: '' },
            topic: { value: '' },

            elementid: { value: '', required: true },
            elementtype: { value: '', required: true },
            parent: { value: '' },

            classes: { value: '' },
            styles: { value: '' },

            heading: { value: '' },
            headingLevel: { value: 'h2' },

            position: { value: 'last' },

            // Configuration data specific to the chosen type
            confData: { value: {} },
        },
        align: 'left',
        inputs: 1,
        inputLabels: '',
        outputs: 1,
        outputLabels: ['uibuilder dynamic UI configuration'],
        icon: 'pencilBoxMultipleWhite.svg',
        paletteLabel: nodeLabel,
        label: function () {
            return `[${this.elementtype}] ${this.parent ? `${this.parent}.` : ''}${this.elementid || this.name || moduleName}`
        },

        /** Prepares the Editor panel */
        oneditprepare: function () { onEditPrepare(this) },

        /** Runs before save (Actually when Done button pressed) - oneditsave */
        oneditsave: function () { onEditSave(this) },

        /** Runs before cancel - oneditcancel */
        /** Handle window resizing for the editor - oneditresize */
        /** Show notification warning before allowing delete - oneditdelete */

    }) // ---- End of registerType() ---- //

}())
