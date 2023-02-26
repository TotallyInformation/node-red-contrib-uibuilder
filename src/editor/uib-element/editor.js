/* eslint-disable strict, sonarjs/no-duplicate-string, sonarjs/no-duplicated-branches */

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
                    A simple but accessible table. <b><a href="./uibuilder/docs/#/elements/tables" target="_blank">Docs</a></b>.
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
            allowsHead: true,
            allowsPos: true,
        },
        sform: {
            value: 'sform',
            label: 'Simple Form',
            description: `
                <p>
                    A simple but accessible Form with inputs and buttons. <b><a href="./uibuilder/docs/#/elements/forms" target="_blank">Docs</a></b>.
                </p><p>
                    Set the incoming <code>msg.payload</code> to an <i>Array of Objects<i>.
                    Each array entry will be a new form input or button.
                    An Object of Objects can also be used where the outer object is key'd by the ID of the entry.
                </p><p>
                    Currently supported properties in the inner objects are: 
                    <code>type=</code>One of the input types listed below, 
                    <code>id=</code>Unique HTML identifier, 
                    <code>label=</code>Label text of the input field or button, 
                    <code>required=</code>true/false whether a value is required,
                    <code>value=</code>Optional starting value.
                </p><p>
                    Other properties can be provided. These only work with the appropriate input types and are otherwise ignored
                </p><p>
                    Available input types are:
                    button, checkbox, color, date, detetime-local, email, hidden, month, number, password, radio, range, tel, text, time, url, week.
                    See <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input" target="_blank">this explanation of the types and properties</a>.
                </p><p>
                    Some additional types will be made available in the future: select, combo, file, image, textarea. Auto-complete will also be added eventually.
                </p><p>
                    If a button is included, pressing the button will automatically send a message from the client back to Node-RED
                    All of the form data will be included in that message in <code>msg._ui.form</code>.
                </p>
            `,
            allowsParent: true,
            allowsHead: true,
            allowsPos: true,
        },
        ul: {
            value: 'ul',
            label: 'Unordered List (ul)',
            description: `
                <p>
                    Outputs a simple, accessible, bullet list.  <b><a href="./uibuilder/docs/#/elements/lists" target="_blank">Docs</a></b>.
                </p><p>
                    Input <code>msg.payload</code> should be an array of strings.
                    An object of key/values can also be used.
                </p>
            `,
            allowsParent: true,
            allowsHead: true,
            allowsPos: true,
        },
        ol: {
            value: 'ol',
            label: 'Ordered List (ol)',
            description: `
                <p>
                    Outputs a simple, accessible, numbered list. <b><a href="./uibuilder/docs/#/elements/lists" target="_blank">Docs</a></b>.
                </p><p>
                    Input <code>msg.payload</code> should be an array of strings.
                    An object of key/values can also be used.
                </p>
            `,
            allowsParent: true,
            allowsHead: true,
            allowsPos: true,
        },
        dl: {
            value: 'dl',
            label: 'Description List (dl)',
            description: `
                <p>
                    Outputs a simple, accessible, description list. <b><a href="./uibuilder/docs/#/elements/lists" target="_blank">Docs</a></b>.
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
            allowsHead: true,
            allowsPos: true,
        },
        article: {
            value: 'article',
            label: 'Text box',
            description: `
                <p>
                    A simple box containing text with an optional heading. <b><a href="./uibuilder/docs/#/elements/other" target="_blank">Docs</a></b>.
                </p>
            `,
            allowsParent: true,
            allowsHead: true,
            allowsPos: true,
        },
        html: {
            value: 'html',
            label: 'HTML',
            description: `
                <p>
                    Pass-through HTML. When sent to the uibuilder node, will be reproduced in your page(s). <b><a href="./uibuilder/docs/#/elements/other" target="_blank">Docs</a></b>.
                </p>
                <p>
                    May be used with the Node-RED core <code>template</code> node.
                </p>
                <p>
                    <b>NOTE</b>: Use with caution, no validity checking is currently done.
                </p>
            `,
            allowsParent: true,
            allowsHead: false,
            allowsPos: true,
        },
        title: {
            value: 'title',
            label: 'Page Title',
            description: `
                <p>
                    Updates the HTML page title and meta description.  <b><a href="./uibuilder/docs/#/elements/lists" target="_blank">Docs</a></b>.
                </p>
                <p>
                    Amends the first <code>&lt;h1></code> tag on the page if it exists else adds one at the top of the page.
                    There should only ever be one H1 tag on a page.
                </p>
                <p>
                    The <b>Parent</b> and <b>HTML ID</b> are ignored in this case
                </p>
                <p>
                    <code>msg.payload</code> must be a simple string.
                </p>
            `,
            allowsParent: false,
            allowsHead: false,
            allowsPos: false,
        },
        li: {
            value: 'li',
            label: 'Add row to existing ordered or unordered list',
            description: `
                <p>
                    Always add a new row to an existing list. (no replace). <b><a href="./uibuilder/docs/#/elements/lists" target="_blank">Docs</a></b>.
                </p><p>
                    Set the <b>Parent</b> to the id of the existing table.
                </p><p>
                    Set the incoming <code>msg.payload</code> to a string.
                </p><p>
                    Set the <b>Position</b> to "first", "last" or a number.
                </p>
            `,
            allowsParent: true,
            allowsHead: false,
            allowsPos: true,
        },
        tr: {
            value: 'tr',
            label: 'Add row to existing table',
            description: `
                <p>
                    Always add a new row to an existing table (no replace). <b><a href="./uibuilder/docs/#/elements/tables" target="_blank">Docs</a></b>.
                </p><p>
                    Set the <b>Parent</b> to the id of the existing table.
                </p><p>
                    Set the incoming <code>msg.payload</code> to an <i>Object<i>.
                    The properties of the object must match the column definitions of the existing table.
                </p><p>
                    Set the <b>Position</b> to "first", "last" or a number.
                </p>
            `,
            allowsParent: true,
            allowsHead: false,
            allowsPos: true,
        },
    }

    // Standard typed input types for string fields
    const stdStrTypes = [
        'msg', 'flow', 'global',
        'str', 'env', 'jsonata', 're',
    ]
    // Standard width for typed input fields
    const tiWidth = '68.5%'

    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {
        // Initial config data
        if (!node.confData) node.confData = {}
        if (!node.parent || node.parent === '') $('#node-input-parent').val('body')
        if (!node.position || node.position === '') {
            $('#node-input-position').val('last')
            node.position = 'last'
        }

        // Define element types for drop-down
        $('#node-input-elementtype').typedInput({
            types: [
                {
                    value: 'elementType',
                    options: Object.values(elTypes),
                }
            ]
        // On-change of element type, update the info panel
        }).on('change', function() {
            // @ts-ignore
            if (elTypes[this.value].description === undefined) elTypes[this.value].description = 'No description available.'
            // @ts-ignore
            $('#type-info').html(elTypes[this.value].description)

            // @ts-ignore
            if ( elTypes[this.value].allowsParent === false ) $('#node-input-parent').prop('disabled', true)
            else $('#node-input-parent').prop('disabled', false)

            // @ts-ignore
            if ( elTypes[this.value].allowsHead === false ) $('#node-input-heading').typedInput('disable')
            else $('#node-input-heading').typedInput('enable')

            // @ts-ignore
            if ( elTypes[this.value].allowsPos === false ) $('#node-input-position').prop('disabled', true)
            else $('#node-input-position').prop('disabled', false)

            // TODO If type is heading - change parent to disabled (perhaps hide the input)
        })

        // parent selector typed input - https://nodered.org/docs/api/ui/typedInput/
        $('#node-input-parent').typedInput({
            types: stdStrTypes,
            default: 'str',
            typeField: $('#node-input-parentSourceType'),
        }).typedInput('width', tiWidth)

        // element id typed input
        $('#node-input-elementid')
            .typedInput({
                types: stdStrTypes,
                default: 'str',
                typeField: $('#node-input-elementIdSourceType'),
            }).typedInput('width', tiWidth)

        // Set up optional heading input
        $('#node-input-heading').typedInput({
            types: stdStrTypes,
            default: 'str',
            typeField: $('#node-input-headingSourceType'),
        }).typedInput('width', '56.5%')

        // position typed input - https://nodered.org/docs/api/ui/typedInput/
        $('#node-input-position').typedInput({
            types: stdStrTypes,
            default: 'str',
            typeField: $('#node-input-positionSourceType'),
        }).typedInput('width', tiWidth)

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
                        // case 'text': {
                        //     templ = document.querySelector('#text-template')
                        //     break
                        // }

                        // case 'table': {
                        //     templ = document.querySelector('#table-template')
                        //     break
                        // }

                        // case 'list':
                        // case 'ol':
                        // case 'ul':
                        // case 'dl': {
                        //     templ = document.querySelector('#list-template')
                        //     break
                        // }

                        default: {
                            // templ = document.createElement('template')
                            templ = document.querySelector('#default-template')
                            break
                        }
                    }
                    // @ts-ignore - Clone the template and apply to the UI
                    docFrag = templ.content.cloneNode(true)
                    $('#el-tab-conf').append(docFrag)
                    // Get any required functions for this type from the template (append runs the script tags immediately)
                    const confFns = window['uibElementConfigFns']
                    // console.log('confFns', confFns.type, confFns)
                    // Re-constitute node.conf properties and values to the conf tab
                    // TODO Deal with select tags
                    Object.keys(node.confData).forEach( conf => {
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

    //#region ---- Validation functions ---- //

    /** Validate a typed input as a string
     * Must not be JSON. Can be a number only if allowNum=true. Can be an empty string only if allowBlank=true
     * Sets typedInput border to red if not valid since custom validation not available on std typedInput types
     * @param {string} value Input value
     * @param {string} inpName Input field name
     * @param {boolean} allowBlank true=allow blank string. Default=true
     * @param {boolean} allowNum true=allow numeric input. Default=false
     * @returns {boolean} True if valid
     */
    function tiValidateOptString(value, inpName, allowBlank = true, allowNum = false) {
        let isValid = true
        let f
        try {
            f = value.slice(0, 1)
        } catch (e) {}

        if (allowBlank === false && value === '') {
            isValid = false
            // console.log({ name: inpName, why: 'Blank failed', value: value, allowBlank: allowBlank })
        }

        if ( allowNum === false && (value !== '' && !isNaN(Number(value))) ) {
            isValid = false
            // console.log({ name: inpName, why: 'Num failed', value: value, allowNum: allowNum })
        }

        if ( f === '{' || f === '[' ) isValid = false

        $(`#node-input-${inpName} + .red-ui-typedInput-container`).css('border-color', isValid ? 'var(--red-ui-form-input-border-color)' : 'red')
        return isValid
    }

    //#endregion ---- Validation functions ---- //

    RED.nodes.registerType(moduleName, {
        category: paletteCategory,
        color: paletteColor,
        defaults: {
            name: { value: '' },
            topic: { value: '' },

            elementtype: { value: 'table', required: true },

            parent: { value: 'body', validate: (v) => tiValidateOptString(v, 'parent', false, false) },
            parentSource: { value: '' }, // ! only here to allow for migration to parentSource field - remove after go-live of v6.1
            parentSourceType: { value: 'str' },

            elementid: { value: '', validate: (v) => tiValidateOptString(v, 'elementid', true, false) },
            elementId: { value: '' }, // ! TODO remove after go-live 6.1
            elementIdSourceType: { value: 'str' },

            heading: { value: '', validate: (v) => tiValidateOptString(v, 'heading', true, false) },
            headingSourceType: { value: 'str' },
            headingLevel: { value: 'h2', required: true },

            position: { value: 'last', validate: (v) => tiValidateOptString(v, 'position', false, true) },
            positionSourceType: { value: 'str' },

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
            return this.name || `[${this.elementtype}] ${this.parent ? `${this.parent}.` : ''}${this.elementid || moduleName}`
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
