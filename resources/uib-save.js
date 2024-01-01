/* eslint-disable strict, sonarjs/no-duplicate-string */

// Isolate this code
;(function () {
    'use strict'

    // NOTE: window.uibuilder is added - see `resources` folder

    // RED._debug({topic: 'RED.settings', payload:RED.settings})

    const uibuilder = window['uibuilder']
    const log = uibuilder.log

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName = 'uib-save'

    /** Copy of deployed uibuilder node instances populated by getUrls() */
    // let uibInstances
    const uibInstances = uibuilder.editorUibInstances

    /** Get all of the currently deployed uibuilder URL's
     * NOTE that the uibuilder.urlsByNodeId cannot be used as that includes disabled nodes/flows
     */
    function getUrls() {
        // uibInstances = uibuilder.getDeployedUrls()
        Object.keys(uibInstances).forEach( (key, i, arr) => {
            $('#node-input-url').append($('<option>', {
                value: uibInstances[key],
                text: uibInstances[key],
                'data-id': key,
            }))
        })
    } // ---- end of getUrls ---- //

    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {
        // initial checkbox states
        $('#node-input-usePageName').prop('checked', node.usePageName)
        $('#node-input-createFolder').prop('checked', node.createFolder)
        $('#node-input-reload').prop('checked', node.reload)

        // Deal with the url
        getUrls()

        $('#node-input-url')
            .on('change', function() {
                node.uibId = Object.keys(uibInstances)[Object.values(uibInstances).indexOf(this.value)]
                // console.log('>> URL Change >>', this.value, node.uibId, Object.keys(uibInstances)[Object.values(uibInstances).indexOf(this.value)])
            })

        if ( node.url && node.url.length > 0 ) {
            $(`#node-input-url option[value="${node.url}"]`).prop('selected', true)
            $('#node-input-url').val(node.url)
        }

        // If "Use pageName" is set, disable the folder and file fields.
        $('#node-input-usePageName').on('change', function() {
            if ($(this).prop('checked') === true) {
                $('#node-input-folder').attr('disabled', true)
                $('#folder').css('color', 'var(--red-ui-tab-text-color-disabled-active)')
                $('#node-input-folder').css('background-color', 'var(--red-ui-form-text-color-disabled)')

                $('#node-input-fname').attr('disabled', true)
                $('#fname').css('color', 'var(--red-ui-tab-text-color-disabled-active)')
                $('#node-input-fname').css('background-color', 'var(--red-ui-form-text-color-disabled)')
            } else {
                $('#node-input-folder').attr('disabled', false)
                $('#folder').removeAttr('style')
                $('#node-input-folder').removeAttr('style')

                $('#node-input-fname').attr('disabled', false)
                $('#fname').removeAttr('style')
                $('#node-input-fname').removeAttr('style')
            }
        })

        uibuilder.doTooltips('#ti-edit-panel') // Do this at the end
    } // ----- end of onEditPrepare() ----- //

    /** Validation function for the URL field - Also updates uibId or url if needed - incl blank on import
     * @param {*} v Value
     * @param {undefined} opt Enables none-bool returns
     * @returns {boolean|string} TRUE if the URL is valid
     */
    function chkUrl(v, opt) {
        this.valid = true
        // @ts-ignore If a new import or paste, blank the url and uibId
        if (this.addType && this.addType === 'paste/import') {
            this.url = ''
            this.uibId = ''
            this.valid = false
        } else if ( this.uibId && this.uibId in uibInstances ) {
            // console.log( 'uibuilder node ID is known', this.url, this.uibId)
            // We know the ID, always look up the latest name
            const chkUrl = uibInstances[this.uibId]
            if (chkUrl !== this.url) { // The url for this node changed so force a re-deploy
                RED.this.dirty(true)
                this.changed = true
            }
            this.url = uibInstances[this.uibId]
        } else if ( Object.values(uibInstances).includes(this.url) ) {
            // console.log( 'We didn't know the id but we found the url', this.url, this.uibId, Object.keys(uibInstances)[Object.values(uibInstances).indexOf(this.url)])
            // We didn't know the ID but we know the last url so set the ID - always force a redeploy in this case
            this.uibId = uibInstances[Object.keys(uibInstances)[Object.values(uibInstances).indexOf(this.url)]]
            RED.nodes.dirty(true)
            this.changed = true
        } else {
            // console.log( 'Neither id nor url found', this.url, this.uibId)
            this.valid = false
            RED.nodes.dirty(true)
            this.changed = true
        }
        return this.valid !== false
    }

    // @ts-ignore
    RED.nodes.registerType(moduleName, {
        defaults: {
            url: { value: '', required: true, validate: chkUrl },
            uibId: { value: '' }, // ID of selected uibuilder instance
            folder: { value: 'src', },
            fname: { value: '', },
            createFolder: { value: false, },
            reload: { value: false, },
            usePageName: { value: false, },
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
        label: function () {
            return this.name || this.url || moduleName
        },
        paletteLabel: moduleName,
        category: uibuilder.paletteCategory,
        color: 'var(--uib-node-colour)', // '#E6E0F8'

        /** Prepares the Editor panel */
        oneditprepare: function () { onEditPrepare(this) },
    }) // ---- End of registerType() ---- //

}())
