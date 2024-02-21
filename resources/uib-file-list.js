/* eslint-disable strict, sonarjs/no-duplicate-string */

// Isolate this code
;(function () {
    'use strict'

    // NOTE: window.uibuilder is added - see `resources` folder

    const uibuilder = window['uibuilder']
    // const log = uibuilder.log

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName = 'uib-file-list'

    // RED._debug({topic: 'RED.settings', payload:RED.settings, moduleName: moduleName})

    /** Copy of deployed uibuilder node instances populated by getUrls() */
    let uibInstances = uibuilder.editorUibInstances

    /** Get all of the currently deployed uibuilder URL's
     * NOTE that the uibuilder.urlsByNodeId cannot be used as that includes disabled nodes/flows
     */
    function getUrls() {
        // Refresh the list
        uibInstances = uibuilder.editorUibInstances
        // Rebuild the drop-down
        Object.keys(uibuilder.sortInstances(uibInstances)).forEach( (key, i, arr) => {
            $('#node-input-url').append($('<option>', {
                value: uibInstances[key],
                text: uibInstances[key],
                'data-id': key,
            }))
        })
    } // ---- end of getUrls ---- //

    function srchRoot(node) {
        if (node.uibId) {
            const uibNode = RED.nodes.node(node.uibId)
            if (uibNode) $('#srch-root').text(`${RED.settings.uibFileListRootFolder}/${uibNode.url}/${node.live ? uibNode.sourceFolder : ''}`)
        } else {
            $('#srch-root').text('⟪ Select UIBUILDER instance above ⟫')
        }
    }

    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {
        // Deal with the url
        getUrls()

        $('#node-input-live')
            .on('change', function() {
                node.live = this.checked
                srchRoot(node)
            })

        $('#node-input-url')
            .on('change', function() {
                node.uibId = Object.keys(uibInstances)[Object.values(uibInstances).indexOf(this.value)]
                // After a paste or import, reset the paste/import flag now we've set a value (to stop chkUrl re-blanking it)
                if (node.addType === 'paste/import') node.addType = 'load'
                // Update the source folder
                srchRoot(node)
            })

        if ( node.url && node.url.length > 0 ) {
            $(`#node-input-url option[value="${node.url}"]`).prop('selected', true)
            $('#node-input-url').val(node.url)
        }

        uibuilder.doTooltips('#ti-edit-panel') // Do this at the end
    } // ----- end of onEditPrepare() ----- //

    /** Validation function for the URL field - Also updates uibId or url if needed - incl blank on import
     * @param {*} v Value
     * @param {undefined} opt Enables none-bool returns
     * @returns {boolean|string} TRUE if the URL is valid
     */
    function chkUrl(v, opt) {
        this.valid = true
        // @ts-ignore
        if (!('changed' in this)) this.changed = false
        // Get the on-screen value as it may be newer (but it is undefined on first load)
        const url = $('#node-input-url').val() || this.url
        // @ts-ignore If a new import or paste, blank the url and uibId
        if (this.addType && this.addType === 'paste/import') {
            // console.log( 'uibuilder node pasted or imported - will blank the url/uibId', this.url, this.uibId)
            this.url = ''
            this.uibId = ''
            this.valid = false
            this.changed = true
        } else if ( this.uibId && this.uibId in uibInstances ) {
            // console.log( 'uibuilder node ID is known', url, this.url, this.uibId)
            // We know the ID, always look up the latest name
            const chkUrl = uibInstances[this.uibId]
            if (chkUrl !== url) { // The url for this node changed so force a re-deploy
                // console.log( 'url for this linked node id changed', chkUrl, url, this.uibId)
                this.url = chkUrl
                this.changed = true
            }
            this.url = uibInstances[this.uibId]
        } else if ( Object.values(uibInstances).includes(url) ) {
            // console.log( 'We didnt know the id but we found the url', url, this.uibId, Object.keys(uibInstances)[Object.values(uibInstances).indexOf(url)])
            // We didn't know the ID but we know the last url so set the ID - always force a redeploy in this case
            this.uibId = uibInstances[Object.keys(uibInstances)[Object.values(uibInstances).indexOf(url)]]
            this.changed = true
        } else {
            // console.log( 'Neither id nor url found', url, this.uibId)
            this.valid = false
            this.changed = true
        }
        if (this.changed === true) RED.nodes.dirty(true)
        return this.valid !== false
    }

    // @ts-ignore
    RED.nodes.registerType(moduleName, {
        defaults: {
            name: { value: '' },
            topic: { value: '' },

            url: { value: '', required: true, validate: chkUrl },
            uibId: { value: '' }, // ID of selected uibuilder instance

            folder: { value: 'src', },
            filter: { value: '', },
            exclude: { value: '', },

            urlOut: { value: true, },
            live: { value: true, },
            fullPrefix: { value: true, },
        },
        align: 'left',
        inputs: 1,
        inputLabels: 'Trigger search',
        outputs: 1,
        outputLabels: ['Search output'],
        icon: 'font-awesome/fa-search',
        label: function () {
            return this.name || this.url ? `Srch '${this.url}'` : undefined || moduleName
        },
        paletteLabel: moduleName,
        category: uibuilder.paletteCategory,
        color: 'var(--uib-node-colour)', // '#E6E0F8'

        /** Prepares the Editor panel */
        oneditprepare: function () { onEditPrepare(this) },
    }) // ---- End of registerType() ---- //
}())
