/* eslint-disable strict */

// Isolate this code
(function () {
    'use strict'

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName  = 'uib-list'
    /** Node's label @constant {string} paletteCategory */
    const nodeLabel  = moduleName
    /** Node's palette category @constant {string} paletteCategory */
    const paletteCategory  = 'uibuilder'
    /** Node's background color @constant {string} paletteColor */
    const paletteColor  = '#F6E0F8' // '#E6E0F8'

    /** Get all of the current uibuilder URL's */
    function getUrls() {
        $.ajax({
            type: 'GET',
            async: false,
            dataType: 'json',
            url: './uibuilder/admin/dummy',
            data: {
                'cmd': 'listinstances',
            },
            success: function(instances) {
                Object.keys(instances).forEach( (val, i, arr) => {
                    $('#node-input-url').append($('<option>', {
                        value: instances[val],
                        text: instances[val],
                    }))
                })

            }
        })

    } // ---- end of getUrls ---- //

    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {
        // initial checkbox states
        if (!node.passthrough) node.passthrough = false
        $('#node-input-passthrough')
            // Initial setting
            .prop('checked', node.passthrough)
            // If the setting changes, change the number of output ports
            .on('change', function passthroughChange() {
                if ( $(this).prop('checked') === true ) {
                    node.outputs = 1
                } else {
                    node.outputs = 0
                }
            })

        // Deal with the url
        getUrls()
        if ( node.url && node.url.length > 0 ) {
            $(`#node-input-url option[value="${node.url}"]`).prop('selected', true)
            $('#node-input-url').val(node.url)
        }

    } // ----- end of onEditPrepare() ----- //

    // @ts-ignore
    RED.nodes.registerType(moduleName, {
        category: paletteCategory,
        color: paletteColor,
        defaults: {
            url: { value: '', required: true },
            elementid: { value: '', required: true },
            elementtype: { value: '', required: true },
            parent: { value: '' },
            passthrough: { value: false },
            outputs: { value: 0 },
            name: { value: '' },
            // topic: { value: '' },
        },
        align: 'right',
        inputs: 1,
        inputLabels: '',
        outputs: 0,
        outputLabels: ['List configuration'],
        icon: 'font-awesome/fa-list',
        paletteLabel: nodeLabel,
        label: function () {
            return `${this.parent ? `${this.parent}.` : ''}${this.elementid || this.name || moduleName} [${this.elementtype}]`
        },

        /** Prepares the Editor panel */
        oneditprepare: function() { onEditPrepare(this) },

        /** Runs before save (Actually when Done button pressed) - oneditsave */
        /** Runs before cancel - oneditcancel */
        /** Handle window resizing for the editor - oneditresize */
        /** Show notification warning before allowing delete - oneditdelete */

    }) // ---- End of registerType() ---- //

}())
