/* eslint-disable strict, sonarjs/no-duplicate-string */

// Isolate this code
;(function () {
    'use strict'

    // NOTE: window.uibuilder is added - see `resources` folder

    // RED._debug({topic: 'RED.settings', payload:RED.settings})

    const uibuilder = window['uibuilder']
    // const log = uibuilder.log

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName = 'uib-update'

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
        if (!node.mode) {
            node.mode = 'update'
            // $('#node-input-mode').typedInput('value', 'update')
        }
        $('#node-input-slotPropMarkdown').prop('checked', node.slotPropMarkdown)

        // mode typed input - https://nodered.org/docs/api/ui/typedInput/
        $('#node-input-mode').typedInput({
            types: [
                {
                    value: 'modeType',
                    options: [
                        {
                            value: 'update',
                            label: 'Update',
                        },
                        {
                            value: 'delete',
                            label: 'Delete',
                        },
                        {
                            value: 'msg.mode',
                            label: 'msg.mode',
                        },
                    ],
                }
            ],
            // typeField: $('#node-input-modeSourceType'),
        })

        // css selector typed input - https://nodered.org/docs/api/ui/typedInput/
        $('#node-input-cssSelector').typedInput({
            types: stdStrTypes,
            default: 'str',
            typeField: $('#node-input-cssSelectorType'),
        })

        // slotSourceProp typed input - https://nodered.org/docs/api/ui/typedInput/
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

        uibuilder.doTooltips('#ti-edit-panel') // Do this at the end
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
        defaults: {
            name: { value: '' },
            topic: { value: '' },

            mode: { value: 'update', required: true },
            modeSourceType: { value: 'update', required: true },

            cssSelector: { value: '', validate: (v) => tiValidateOptString(v, 'cssSelector', false, true) },
            cssSelectorType: { value: 'str', required: true },

            slotSourceProp: { value: '', validate: () => true }, // allow anything including blank
            slotSourcePropType: { value: 'msg' },

            attribsSource: { value: '', validate: () => true },
            attribsSourceType: { value: 'msg' },

            slotPropMarkdown: { value: false },
        },
        align: 'left',
        inputs: 1,
        inputLabels: 'Source data',
        outputs: 1,
        outputLabels: ['uibuilder dynamic UI configuration'],
        icon: 'pencilProgressWhiteSmaller.svg',
        label: function () {
            return this.name || `${this.mode}${this.cssSelectorType === 'str' ? ` ${this.cssSelector.replace(/.*::/, '')}` : ''}`  || moduleName
        },
        paletteLabel: moduleName,
        category: uibuilder.paletteCategory,
        color: 'var(--uib-node-colour)', // '#E6E0F8'

        /** Prepares the Editor panel */
        oneditprepare: function () { onEditPrepare(this) },
    }) // ---- End of registerType() ---- //
}())
