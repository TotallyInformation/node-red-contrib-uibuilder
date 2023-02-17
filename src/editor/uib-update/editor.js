/* eslint-disable strict, sonarjs/no-duplicate-string */

// Isolate this code
(function () {
    'use strict'

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName = 'uib-update'
    /** Node's label @constant {string} paletteCategory */
    const nodeLabel = moduleName
    /** Node's palette category @constant {string} paletteCategory */
    const paletteCategory = 'uibuilder'
    /** Node's background color @constant {string} paletteColor */
    const paletteColor = '#E6E0F8'

    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {
        $('#node-input-slotPropMarkdown').prop('checked', node.slotPropMarkdown)

        // @ts-expect-error
        /** @type {editorClient.WidgetTypedInputTypeDefinition)[]} */
        const inputTypes = [
            'msg', 'flow', 'global',
            'str', 'num', 'bool', 'date',
            'env', 'jsonata', 're', 'json',
            // 'bin', 'cred',
        ]

        // css selector typed input - https://nodered.org/docs/api/ui/typedInput/
        $('#node-input-cssSelector').typedInput({
            types: [
                'msg', 'flow', 'global',
                'str', 'env', 'jsonata', 're',
            ],
            default: 'str',
            typeField: $('#node-input-cssSelectorType')
        }).typedInput('width', '73%')

        // slotSourceProp typed input - https://nodered.org/docs/api/ui/typedInput/
        $('#node-input-slotSourceProp').typedInput({
            types: inputTypes,
            default: 'msg',
            typeField: $('#node-input-slotSourcePropType')
        }).typedInput('width', '73%')

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
        }).typedInput('width', '73%')

    } // ----- end of onEditPrepare() ----- //

    // @ts-ignore
    RED.nodes.registerType(moduleName, {
        category: paletteCategory,
        color: paletteColor,
        defaults: {
            name: { value: '' },
            topic: { value: '' },

            cssSelector: { value: '', required: true },
            cssSelectorType: { value: 'str', required: true },

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
        icon: 'pencilProgressWhiteSmaller.svg',
        paletteLabel: nodeLabel,
        label: function () {
            return `${this.cssSelectorType}.${this.cssSelector.replace(/.*::/, '')}` || this.name || moduleName
        },

        /** Prepares the Editor panel */
        oneditprepare: function () { onEditPrepare(this) },

    }) // ---- End of registerType() ---- //

}())
