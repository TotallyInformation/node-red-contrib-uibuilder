/* eslint-disable strict, sonarjs/no-duplicate-string */

// Isolate this code
(function () {
    'use strict'

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName = 'uib-save'
    /** Node's label @constant {string} paletteCategory */
    const nodeLabel = moduleName
    /** Node's palette category @constant {string} paletteCategory */
    const paletteCategory  = window['uibuilder'].paletteCategory
    /** Node's background color @constant {string} paletteColor */
    const paletteColor  = 'var(--uib-node-colour)' // '#E6E0F8'

    // TODO Change to use window.uibuilder
    /** Copy of all deployed uibuilder node instances */
    let uibInstances = null

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
                console.log('>> Instances >>', instances, Object.entries(instances) )

                uibInstances = instances

                Object.keys(instances).forEach( (key, i, arr) => {
                    $('#node-input-url').append($('<option>', {
                        value: instances[key],
                        text: instances[key],
                        'data-id': key,
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
        $('#node-input-createFolder').prop('checked', node.createFolder)
        $('#node-input-reload').prop('checked', node.reload)

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

    // @ts-ignore
    RED.nodes.registerType(moduleName, {
        category: paletteCategory,
        color: paletteColor,
        defaults: {
            url: { value: '', required: true },
            uibId: { value: '' }, // ID of selected uibuilder instance
            folder: { value: 'src', },
            fname: { value: '', },
            createFolder: { value: false, },
            reload: { value: false, },
            encoding: { value: 'utf8' },
            mode: { value: 0o666 },
            name: { value: '' },
            topic: { value: '' },
        },
        align: 'left',
        inputs: 1,
        inputLabels: 'File content to save',
        // outputs: 1,
        // outputLabels: ['HTML payload'],
        icon: 'font-awesome/fa-floppy-o',
        paletteLabel: nodeLabel,
        label: function () {
            return this.name || this.url || moduleName
        },

        /** Prepares the Editor panel */
        oneditprepare: function () { onEditPrepare(this) },

    }) // ---- End of registerType() ---- //

}())
