/* eslint-disable strict, sonarjs/no-duplicate-string */

// Isolate this code
(function () {
    'use strict'

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName = 'uib-tag'
    /** Node's label @constant {string} paletteCategory */
    const nodeLabel = moduleName
    /** Node's palette category @constant {string} paletteCategory */
    const paletteCategory = 'uibuilder'
    /** Node's background color @constant {string} paletteColor */
    const paletteColor = '#E6E0F8'

    const inputTypes = [
        'msg', 'flow', 'global',
        'str', 'num', 'bool', 'date',
        'env', 'jsonata', 're', 'json',
        // 'bin', 'cred',
    ]
    // Standard typed input types for string fields
    const stdStrTypes = [
        'msg', 'flow', 'global',
        'str', 'env', 'jsonata', 're',
    ]

    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {
        $('#node-input-slotPropMarkdown').prop('checked', node.slotPropMarkdown)

        if (!node.parent || node.parent === '') $('#node-input-parent').val('body')
        if (!node.position || node.position === '') {
            $('#node-input-position').val('last')
            node.position = 'last'
        }

        // Define tag - typed input - https://nodered.org/docs/api/ui/typedInput/
        $('#node-input-tag').typedInput({
            types: stdStrTypes,
            default: 'str',
            typeField: $('#node-input-tagSourceType'),
        })

        // parent selector typed input - https://nodered.org/docs/api/ui/typedInput/
        $('#node-input-parent').typedInput({
            types: stdStrTypes,
            default: 'str',
            typeField: $('#node-input-parentSourceType'),
        }) // .typedInput('width', tiWidth)

        // element id typed input
        $('#node-input-elementId').typedInput({
            types: stdStrTypes,
            default: 'str',
            typeField: $('#node-input-elementIdSourceType'),
        }) // .typedInput('width', tiWidth)

        // position typed input
        $('#node-input-position').typedInput({
            types: stdStrTypes,
            default: 'str',
            typeField: $('#node-input-positionSourceType'),
        }) // .typedInput('width', tiWidth)

        // slotSourceProp typed input
        $('#node-input-slotSourceProp').typedInput({
            types: inputTypes,
            default: 'msg',
            typeField: $('#node-input-slotSourcePropType')
        })

        $('#node-input-slotPropMarkdown').on('change', function() {
            if ($(this).is(':checked') === false) {
                $('#slotPropMarkdown-unchecked').show()
                $('#slotPropMarkdown-checked').hide()
            } else {
                $('#slotPropMarkdown-unchecked').hide()
                $('#slotPropMarkdown-checked').show()
            }
        })

        // attribsSource typed input - https://nodered.org/docs/api/ui/typedInput/
        $('#node-input-attribsSource').typedInput({
            types: ['msg', 'flow', 'global', 'json', 'jsonata',],
            default: 'msg',
            typeField: $('#node-input-attribsSourceType')
        })

    } // ----- end of onEditPrepare() ----- //

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

    // @ts-ignore
    RED.nodes.registerType(moduleName, {
        category: paletteCategory,
        color: paletteColor,
        defaults: {
            name: { value: '' },
            topic: { value: '' },

            tag: { value: '', validate: (v) => tiValidateOptString(v, 'tag', false, false) }, // RED.validators.regex(/^((?!<|>).)*$/) },

            parent: { value: 'body', validate: (v) => tiValidateOptString(v, 'parent', false, false) },
            parentSource: { value: '' }, // ! only here to allow for migration to parentSource field - remove after go-live of v6.1
            parentSourceType: { value: 'str' },

            elementId: { value: '', validate: (v) => tiValidateOptString(v, 'elementId', true, false) },
            elementIdSourceType: { value: 'str' },

            position: { value: 'last', validate: (v) => tiValidateOptString(v, 'position', false, true) },
            positionSourceType: { value: 'str' },

            slotSourceProp: { value: '' },
            slotSourcePropType: { value: 'msg' },

            attribsSource: { value: '' },
            attribsSourceType: { value: 'msg' },

            slotPropMarkdown: { value: false },
        },
        align: 'left',
        inputs: 1,
        inputLabels: 'Source data',
        outputs: 1,
        outputLabels: ['uibuilder dynamic UI configuration'],
        icon: 'font-awesome/fa-tag',
        paletteLabel: nodeLabel,
        label: function () {
            // return this.name || `${this.mode}${this.cssSelectorType === 'str' ? ` ${this.cssSelector.replace(/.*::/, '')}` : ''}`  || moduleName
            return this.name || `[${this.tag}] ${this.parent ? `${this.parent}.` : ''}${this.elementId || moduleName}`
        },

        /** Prepares the Editor panel */
        oneditprepare: function () { onEditPrepare(this) },

    }) // ---- End of registerType() ---- //

}())
