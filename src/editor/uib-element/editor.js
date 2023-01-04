/* eslint-disable strict, sonarjs/no-duplicate-string */

// Isolate this code
(function () {
    'use strict'

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName = 'uib-element'
    /** Node's label @constant {string} paletteCategory */
    const nodeLabel = moduleName
    /** Node's palette category @constant {string} paletteCategory */
    const paletteCategory = 'uibuilder'
    /** Node's background color @constant {string} paletteColor */
    const paletteColor = '#F6E0F8' // '#E6E0F8'

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
            success: function (instances) {
                const urls = []
                Object.keys(instances).forEach((val, i, arr) => {
                    urls.push({ value: instances[val], label: instances[val] })
                    // $('#node-input-url').append($('<option>', {
                    //     value: instances[val],
                    //     text: instances[val],
                    // }))
                })

                $('#node-input-url').typedInput({
                    types: [
                        {
                            value: 'urls',
                            options: urls,
                        }
                    ]
                })
            }
        })

    } // ---- end of getUrls ---- //

    /** Populate the store dropdown */
    function populateUseStoreDropdown() {
        const storeNames = []

        RED.settings.context.stores.forEach(store => {
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
                if ($(this).prop('checked') === true) {
                    node.outputs = 1
                } else {
                    node.outputs = 0
                }
            })

        // Initial conf data
        if (!node.confData) node.confData = {}

        // Define element types for drop-down
        $('#node-input-elementtype').typedInput({
            types: [
                {
                    value: 'elementType',
                    options: [
                        // @ts-expect-error
                        { value: 'table', label: 'Simple Table' },
                        // @ts-expect-error
                        { value: 'ul', label: 'Unordered List (ul)' },
                        // @ts-expect-error
                        { value: 'ol', label: 'Ordered List (ol)' },
                        // @ts-expect-error
                        { value: 'dl', label: 'Description List (dl)' },
                        // ts-expect-error
                        // { value: 'text', label: 'Text output with label' },
                    ]
                }
            ]
        })

        // One-day maybe, request put in, doesn't currently work since context isn't an option
        // $('#node-input-store').typedInput({
        //     type: 'str',
        //     default: 'node',
        //     types: ['context', 'flow', 'global'],
        //     typeField: '#node-input-store-type'
        // })
        $('#node-input-storeContext').typedInput({ // eslint-disable-line sonarjs/no-duplicate-string
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

        $('#node-input-storeContext').on('change', function () {
            if ($(this).val() === 'context') {
                $('#node-input-varName').val('uib_el').prop('disabled', true)
            } else {
                $('#node-input-varName').val(`uib_el_${node.id}`).prop('disabled', false)
            }
        })

        // Set up context store select drop-down
        populateUseStoreDropdown()

        // Deal with the url
        getUrls()
        if (node.url && node.url.length > 0) {
            $(`#node-input-url option[value="${node.url}"]`).prop('selected', true)
            $('#node-input-url').val(node.url)
        }

        // If caching turned off, grey out settings
        $('#node-input-cacheOn').on('change', function () {
            // @ts-expect-error
            if (this.checked === true) {
                // @ts-expect-error
                $('#node-input-storeName').typedInput('enable')
                // @ts-expect-error
                $('#node-input-storeContext').typedInput('enable')
                if ($('#node-input-storeContext').val() !== 'context') $('#node-input-varName').prop('disabled', false)
                $('#node-input-newcache').prop('disabled', false)
            } else {
                // @ts-expect-error
                $('#node-input-storeName').typedInput('disable')
                // @ts-expect-error
                $('#node-input-storeContext').typedInput('disable')
                $('#node-input-varName').prop('disabled', true)
                $('#node-input-newcache').prop('disabled', true)
            }
        })

        // TODO reset unused conf props on type change?

        // Delegated event handler for conf data - just marks things as changed
        $('#el-tab-conf').on('change', '[data-uib-el-prop]', function() {
            $(this).attr('data-changed', 'true')
        })

        const tabs = RED.tabs.create({
            id: 'el-tabs',
            // scrollable: true,
            // collapsible: true,
            onchange: function (tab) {
                let templ, docFrag
                $('#el-tabs-content').children().hide()
                // Populate the element config tab based on type
                if ( tab.id === 'el-tab-conf') {
                    const type = $('#node-input-elementtype').val()
                    switch (type) { // eslint-disable-line sonarjs/no-small-switch
                        case 'text': {
                            templ = document.querySelector('#text-template')
                            break
                        }

                        case 'table': {
                            templ = document.querySelector('#table-template')
                            break
                        }

                        case 'list':
                        case 'ol':
                        case 'ul':
                        case 'dl': {
                            templ = document.querySelector('#list-template')
                            break
                        }

                        default: {
                            templ = document.createElement('template')
                            break
                        }
                    }
                    // @ts-ignore - Clone the template and apply to the UI
                    docFrag = templ.content.cloneNode(true)
                    $('#el-tab-conf').append(docFrag)
                    // Get any required functions for this type from the template (append runs the script tags immediately)
                    const confFns = window['uibElementConfigFns']
                    console.log('confFns', confFns.type, confFns)
                    // Re-constitute node.conf properties and values to the conf tab
                    Object.keys(node.confData).forEach( conf => {
                        // TODO Deal with select tags
                        $(`#conf-${type}-${conf}`).val(node.confData[conf])
                    })
                } else {
                    $('#el-tab-conf').empty()
                }
                $('#' + tab.id).show()
            }
        })
        tabs.addTab({
            id: 'el-tab-main',
            label: 'Main'
        })
        tabs.addTab({
            id: 'el-tab-conf',
            label: 'Element Config'
        })

    } // ----- end of onEditPrepare() ----- //

    /** Prep for save
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditSave(node) {
        $('[data-changed="true"]').each(function(i) {
            node.confData[this.dataset.prop] = $(this).val()
            node.changed = true
            RED.nodes.dirty(true)
        })
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
            wrapper: { value: '' },
            passthrough: { value: false },
            outputs: { value: 0 },
            name: { value: '' },
            // Configuration data specific to the chosen type
            confData: { value: {} },
            // Caching
            cacheOn: { value: true },
            storeName: { value: 'default', required: true },
            storeContext: { value: 'context' },
            varName: { value: 'uib_el', required: true },
            newcache: { value: true },
        },
        align: 'right',
        inputs: 1,
        inputLabels: '',
        outputs: 0,
        outputLabels: ['uibuilder dynamic UI configuration'],
        icon: 'font-awesome/fa-code',
        paletteLabel: nodeLabel,
        label: function () {
            return `<${this.url}>${this.parent ? `${this.parent}.` : ''}${this.elementid || this.name || moduleName} [${this.elementtype}]`
        },

        /** Prepares the Editor panel */
        oneditprepare: function () { onEditPrepare(this) },

        /** Runs before save (Actually when Done button pressed) - oneditsave */
        oneditsave: function () { onEditSave(this) },

        /** Runs before cancel - oneditcancel */
        /** Handle window resizing for the editor - oneditresize */
        /** Show notification warning before allowing delete - oneditdelete */

    }) // ---- End of registerType() ---- //

}())
