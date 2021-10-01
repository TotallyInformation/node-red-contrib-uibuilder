/* eslint-disable strict */

// Isolate this code
(function () {
    'use strict'

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName  = 'uib-receiver'
    /** Node's label @constant {string} paletteCategory */
    const nodeLabel  = 'uib-receiver'
    /** Node's palette category @constant {string} paletteCategory */
    const paletteCategory  = 'uibuilder'
    /** Node's background color @constant {string} paletteColor */
    const paletteColor  = '#E6E0F8'

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
                //console.log('>>>>', instances)

                Object.keys(instances).forEach( (val, i, arr) =>{
                    $('#node-input-url').append($('<option>', { 
                        value: instances[val],
                        text : instances[val],
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
                node.outputs = this.checked ? 1 : 0
            })
        
        // Deal with the url
        getUrls()
        $('#node-input-url')
            .on('change', function() {
                console.log('>>>>', this.value)
            })
        if ( node.url && node.url.length > 0 ) {
            $(`#node-input-url option[value="${node.url}"]`).prop('selected', true)
            $('#node-input-url').val(node.url)
        }

    } // ----- end of onEditPrepare() ----- //

    RED.nodes.registerType(moduleName, {
        category: paletteCategory,
        color: paletteColor,
        defaults: {
            url: { value: '', required: true },
            name: { value: '' },
            topic: { value: '' },
            passthrough: { value: false },
            outputs: { value: 0 },
        },
        align:'right',
        inputs: 1,
        inputLabels: 'Msg with topic property',
        outputs: 0,
        outputLabels: ['Input msg with node ID added'],
        icon: 'link-out.svg',
        paletteLabel: nodeLabel,
        label: function () { return this.url || this.name || nodeLabel },

        oneditprepare: function() { onEditPrepare(this) },
        
    }) // ---- End of registerType() ---- //

}())
