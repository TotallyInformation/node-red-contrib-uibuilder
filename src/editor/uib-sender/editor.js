/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable strict */

// Isolate this code
(function () {
    'use strict'

    const uibuilder = window['uibuilder']
    const mylog = uibuilder.log

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName  = 'uib-sender'
    /** Node's label @constant {string} paletteCategory */
    const nodeLabel  = 'uib-sender'
    /** Node's palette category @constant {string} paletteCategory */
    const paletteCategory  = uibuilder.paletteCategory
    /** Node's background color @constant {string} paletteColor */
    const paletteColor  = 'var(--uib-node-colour)' // '#E6E0F8'

    /** Copy of all deployed uibuilder node instances */
    let uibInstances

    /** Get all of the current uibuilder URL's */
    function getUrls() {
        uibInstances = uibuilder.getDeployedUrls()
        Object.keys(uibInstances).forEach( (key, i, arr) => {
            $('#node-input-url').append($('<option>', {
                value: uibInstances[key],
                text: uibInstances[key],
                'data-id': key,
            }))
        })
        // $.ajax({
        //     type: 'GET',
        //     async: false,
        //     dataType: 'json',
        //     url: './uibuilder/admin/dummy',
        //     data: {
        //         'cmd': 'listinstances',
        //     },
        //     success: function(instances) {
        //         console.log('>> Instances >>', instances, Object.entries(instances) )

        //         uibInstances = instances

        //         Object.keys(instances).forEach( (key, i, arr) => {
        //             $('#node-input-url').append($('<option>', {
        //                 value: instances[key],
        //                 text: instances[key],
        //                 'data-id': key,
        //             }))
        //         })

        //     }
        // })
    } // ---- end of getUrls ---- //

    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {
        mylog('uib-sender onEditPrepare ', node)

        // initial checkbox states
        if (!node.passthrough) node.passthrough = false
        $('#node-input-passthrough')
            // Initial setting
            .prop('checked', node.passthrough)
            // If the setting changes, change the number of output ports
            .on('change', function passthroughChange() {
                if ( $(this).prop('checked') === true ) {
                    node.outputs = 1
                    $('#node-input-return').prop('checked', false)
                } else if ( $('#node-input-return').prop('checked') === false ) {
                    node.outputs = 0
                }
            })
        if (!node.return) node.return = false
        $('#node-input-return')
            // Initial setting
            .prop('checked', node.return)
            // If the setting changes, change the number of output ports
            .on('change', function returnChange() {
                if ( $(this).prop('checked') === true ) {
                    node.outputs = 1
                    $('#node-input-passthrough').prop('checked', false)
                } else if ( $('#node-input-passthrough').prop('checked') === false ) {
                    node.outputs = 0
                }
            })

        // Deal with the url
        getUrls()

        if ( node.uibId in uibInstances ) {
            // console.log( 'uibuilder node ID is known', node.url, node.uibId)
            // We know the ID, always look up the latest name
            const chkUrl = uibInstances[node.uibId]
            if (chkUrl !== node.url) { // The url for this node changed so force a re-deploy
                RED.nodes.dirty(true)
                node.changed = true
            }
            node.url = uibInstances[node.uibId]
        } else if ( Object.values(uibInstances).includes(node.url) ) {
            // console.log( 'We didnt know the id but we found the url', node.url, node.uibId, Object.keys(uibInstances)[Object.values(uibInstances).indexOf(node.url)])
            // We didn't know the ID but we know the last url so set the ID - always force a redeploy in this case
            node.uibId = uibInstances[Object.keys(uibInstances)[Object.values(uibInstances).indexOf(node.url)]]
            RED.nodes.dirty(true)
            node.changed = true
        } else {
            // console.log( 'Neither id nor url found', node.url, node.uibId)
            node.valid = false
        }

        $('#node-input-url')
            .on('change', function() {
                node.uibId = Object.keys(uibInstances)[Object.values(uibInstances).indexOf(this.value)]
                // console.log('>> URL Change >>', this.value, node.uibId, Object.keys(uibInstances)[Object.values(uibInstances).indexOf(this.value)])
            })

        if ( node.url && node.url.length > 0 ) {
            $(`#node-input-url option[value="${node.url}"]`).prop('selected', true)
            $('#node-input-url').val(node.url)
        }

        window['tiDoTooltips']('#ti-edit-panel') // Do this at the end
    } // ----- end of onEditPrepare() ----- //

    /** When node type is added to the palette
     * Which happens on load of the Editor
     * @param {*} node -
     */
    function onPaletteAdd(node) {
        // console.log('uib-sender onPaletteAdd ', node)
    } // ---- End of onPaletteAdd ---- //

    // @ts-ignore
    RED.nodes.registerType(moduleName, {
        category: paletteCategory,
        color: paletteColor,
        defaults: {
            url: { value: '', required: true },
            uibId: { value: '' }, // ID of selected uibuilder instance
            name: { value: '' },
            topic: { value: '' },
            passthrough: { value: false },
            return: { value: false },
            outputs: { value: 0 },
        },
        align: 'right',
        inputs: 1,
        inputLabels: 'Msg with topic property',
        outputs: 0,
        outputLabels: ['Input msg with node ID added'],
        icon: 'link-out.svg',
        paletteLabel: nodeLabel,
        label: function () { return this.name || this.url || nodeLabel },

        oneditprepare: function() { onEditPrepare(this) },

        /** When this node is added to the palette - happens on (re)load of Editor as well */
        onpaletteadd: function() { onPaletteAdd(this) },

    }) // ---- End of registerType() ---- //

}())
