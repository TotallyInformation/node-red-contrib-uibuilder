/* eslint-disable sonarjs/no-duplicate-string */

// Isolate this code
;(function () {
    'use strict'

    // NOTE: window.uibuilder is added - see `resources` folder
    // RED._debug({topic: 'RED.settings', payload:RED.settings})

    const uibuilder = window['uibuilder']
    // const log = uibuilder.log

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName  = 'uib-cache'

    /** Populate the store dropdown */
    function populateUseStoreDropdown() {
        const storeNames = []

        RED.settings.context.stores.forEach( store => {
            storeNames.push({ value: store, label: store })
        })

        $('#node-input-storeName').typedInput({
            types: [
                {
                    value: 'storeNames',
                    options: storeNames,
                }
            ]
        })
    }

    /** Return a text string showing if caching by a key
     * @returns {string} Text to show if "Cache By" is set
     */
    function helpTextNumMsgsCacheBy() {
        return ` <b>for each msg.${$('#node-input-cacheKey').val()} value</b>`
    }

    /** If caching my a msg.xxxxx value, show/hide bits of help text
     * @param {boolean} isVisible Whether the Cache By field is visible
     */
    function keyVisibility(isVisible) {
        if (isVisible === true) {

            $('#cacheKey-row').show()
            $('#help-per').show()
            $('#caspan').hide()
        } else {
            $('#cacheKey-row').hide()
            $('#help-per').hide()
            $('#caspan').show()
        }
    }

    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {
        // initial checkbox states
        // if (!node.persistence) node.persistence = false
        if (!node.cacheall) node.persistence = false

        // Make sure that the key always has a value (and is not '') - default to msg.topic
        if ( !node.cacheKey ) node.cacheKey = 'topic'

        if ( !node.varName ) {
            node.varName = 'uib_cache'
            $('#node-input-varName').val('uib_cache')
        }

        // Populate Type dropdown: node, flow, global
        $('#node-input-storeContext').typedInput({
            type: 'contextType',
            types: [
                {
                    value: 'contextType',
                    options: [
                        // @ts-expect-error
                        { value: 'context', label: 'Node' },
                        // @ts-expect-error
                        { value: 'flow', label: 'Flow' },
                        // @ts-expect-error
                        { value: 'global', label: 'Global' },
                    ]
                }
            ]
        })

        // Set up context store select drop-down
        populateUseStoreDropdown()

        // Update help text if Cache By value changes
        $('#node-input-cacheKey').on('change', function() {
            $('#help-per').html( helpTextNumMsgsCacheBy() )
        })

        // Either all or by prop, not both
        $('#node-input-cacheall').on('change', function() {
            keyVisibility(!$(this).is(':checked'))
        })

        $('#node-input-storeContext').on('change',  function() {
            if ( $(this).val() === 'context' ) {
                $('#node-input-varName').val('uib_cache').prop( 'disabled', true )
            } else {
                $('#node-input-varName').val(`uib_cache_${node.id}`).prop( 'disabled', false )
            }
        })

        uibuilder.doTooltips('#ti-edit-panel') // Do this at the end
    } // ----- end of onEditPrepare() ----- //

    RED.nodes.registerType(moduleName, {
        defaults: {
            cacheall: { value: false },
            cacheKey: { value: 'topic' },
            newcache: { value: true },
            num: { value: 1, required: true },
            // persistence: { value: false },
            storeName: { value: 'default', required: true },
            name: { value: '' },
            // store: { },
            // store-type: {},
            storeContext: { value: 'context' },
            varName: { value: 'uib_cache', required: true }
        },
        // align:'right',
        inputs: 1,
        inputLabels: 'Msg to cache or cache control msg',
        outputs: 1,
        outputLabels: ['Through msg or msg from cache'],
        icon: 'parser-json.svg',
        label: function () {
            if ( this.cacheall === true ) return this.name || `Cache All (${this.num})`
            return this.name || `Cache by msg.${this.cacheKey} (${this.num})`
        },
        paletteLabel: moduleName,
        category: uibuilder.paletteCategory,
        color: 'var(--uib-node-colour)', // '#E6E0F8'

        oneditprepare: function() { onEditPrepare(this) },
    }) // ---- End of registerType() ---- //
}())
