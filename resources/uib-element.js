/* eslint-disable strict, sonarjs/no-duplicate-string, sonarjs/no-duplicated-branches */

/** Node-RED WidgetTypedInputType
 * @typedef { Array<"bin"|"bool"|"date"|"env"|"flow"|"global"|"json"|"jsonata"|"msg"|"num"|"re"|"str"> } WidgetTypedInputType
 */

// Isolate this code
;(function () {
    'use strict'

    // NOTE: window.uibuilder is added - see `resources` folder

    // RED._debug({topic: 'RED.settings', payload:RED.settings})

    const uibuilder = window['uibuilder']
    const log = uibuilder.log

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName = 'uib-element'

    /** Element Types definitions - updated by onEditPrepare->getTypesList API call */
    let elTypes

    /** Standard typed input types for string fields
     * @type {WidgetTypedInputType}
     */
    const stdStrTypes = [
        'msg', 'flow', 'global',
        'str', 'env', 'jsonata', 're',
    ]
    // Standard width for typed input fields
    const tiWidth = uibuilder.typedInputWidth

    /** Get the list of available types via API call, updates elTypes
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function getTypesList(node) {
        $.ajax({
            url: './uibuilder/admin/nourl',
            method: 'GET',
            async: false,
            dataType: 'json',
            data: {
                cmd: 'getElements',
            },
            beforeSend: function(jqXHR) {
                const authTokens = RED.settings.get('auth-tokens')
                if (authTokens) {
                    jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
                }
            },
            success: function(data) {
                log('[uib-element:onEditPrepare:getElTypes] Data updated successfully', data)
                elTypes = data
            },
        })
            .fail(function(_jqXHR, textStatus, errorThrown) {
                console.error( '[uib-element:onEditPrepare:getElTypes] Error ' + textStatus, errorThrown )
            })
    }

    function getOneType(elType) {
        $.ajax({
            url: './uibuilder/admin/-nourl-',
            method: 'GET',
            async: false,
            dataType: 'json',
            data: {
                cmd: 'getOneElement',
                elType: elType,
                // @ts-ignore - Current user's browser languages via jQuery extension 
                languages: $.i18n.languages,
            },
            beforeSend: function(jqXHR) {
                log('[uib-element:getOneType:getEl] Preparing to get el type descr/opts. ', elType, $.i18n.languages)
                const authTokens = RED.settings.get('auth-tokens')
                if (authTokens) {
                    jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
                }
            },
            success: function(data) {
                log('[uib-element:getOneType:getEl] Data retrieved successfully', data)
                elTypes[elType].description = data.descHtml
                elTypes[elType].options = data.optsHtml
            },
        })
            .fail(function(_jqXHR, textStatus, errorThrown) {
                console.error( '[uib-element:getOneType:getEl] Error ' + textStatus, errorThrown )
            })
    }

    /** Update advanced settings tab for an element
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function advElTab(node) {
        // node.elementtype
        const type = $('#node-input-elementtype').val()

        // @ts-ignore - Clone the template and apply to the UI
        // const docFrag = templ.content.cloneNode(true)
        // $('#el-tab-conf').append(docFrag)
        $('#el-tab-conf').html(elTypes[type].options)
        // Get any required functions for this type from the template (append runs the script tags immediately)
        // const confFns = window['uibElementConfigFns']
        // console.log('confFns', confFns.type, confFns)
        // Re-constitute node.conf properties and values to the conf tab
        // TODO Deal with select tags
        Object.keys(node.confData).forEach( conf => {
            $(`#conf-${type}-${conf}`).val(node.confData[conf])
        })
    }

    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {
        // Initial config data
        if (!node.confData) node.confData = {}
        if (node.parent === '' || !node.parent) $('#node-input-parent').val('body')
        if (node.position === '' || !node.position ) {
            $('#node-input-position').val('last')
            node.position = 'last'
        }

        // Update elTypes
        getTypesList(node)

        // initial checkbox states
        if (!node.passthrough) node.passthrough = false

        // Define element types for drop-down
        $('#node-input-elementtype').typedInput({
            types: [
                {
                    value: 'elementType',
                    options: Object.values(elTypes),
                }
            ]
        // On-change of element type, update the info panel
        }).on('change', function() {
            log('[uib-element:onEditPrepare] Element type changed. ', this.value)
            // Get the description and adv options HTML, updates elTypes
            getOneType(this.value)
            log('[uib-element:onEditPrepare] Element description & adv. opts updated. ', this.value)

            // @ts-ignore
            if (elTypes[this.value].description === undefined) elTypes[this.value].description = 'No description available.'
            // @ts-ignore
            $('#type-info').html(elTypes[this.value].description)

            // @ts-ignore
            if ( elTypes[this.value].allowsParent === false ) $('#node-input-parent').prop('disabled', true)
            else $('#node-input-parent').prop('disabled', false)

            // @ts-ignore
            if ( elTypes[this.value].allowsHead === false ) $('#node-input-heading').typedInput('disable')
            else $('#node-input-heading').typedInput('enable')

            // @ts-ignore
            if ( elTypes[this.value].allowsPos === false ) $('#node-input-position').prop('disabled', true)
            else $('#node-input-position').prop('disabled', false)

            // TODO If type is heading - change parent to disabled (perhaps hide the input)
        })

        // parent selector typed input - https://nodered.org/docs/api/ui/typedInput/
        $('#node-input-parent').typedInput({
            types: stdStrTypes,
            default: 'str',
            typeField: $('#node-input-parentSourceType'),
        }).typedInput('width', tiWidth)

        // element id typed input
        $('#node-input-elementid')
            .typedInput({
                types: stdStrTypes,
                default: 'str',
                typeField: $('#node-input-elementIdSourceType'),
            }).typedInput('width', tiWidth)

        // Set up optional heading input
        $('#node-input-heading').typedInput({
            types: stdStrTypes,
            default: 'str',
            typeField: $('#node-input-headingSourceType'),
        }).typedInput('width', '40%')

        // @ts-ignore core data typed input
        $('#node-input-data').typedInput({
            // types: stdStrTypes,
            default: 'msg',
            typeField: $('#node-input-dataSourceType'),
        }).on('change', function(event, type, value) {
            // console.log('change')
            if ( type === 'msg' && !this.value ) {
                $('#node-input-data').typedInput('value', 'payload')
                // console.log('change 2')
            }
        } ).typedInput('width', tiWidth)

        // position typed input
        $('#node-input-position').typedInput({
            types: stdStrTypes,
            default: 'str',
            typeField: $('#node-input-positionSourceType'),
        }).typedInput('width', tiWidth)

        // Ensure data value never blank
        // $('#node-input-data').on('change', function(event, type, value) {
        //     if ( !value ) {
        //         if ( type === 'msg' ) $('#node-input-data').typedInput('value', 'payload')
        //     }
        // } )

        // Make position of aria-labels dynamic to cursor
        // $('#ti-edit-panel *[aria-label]').on('mousemove', function(event) {
        //     document.documentElement.style.setProperty('--x', event.pageX )
        //     document.documentElement.style.setProperty('--y', event.pageY )
        //     document.documentElement.style.setProperty('--moveX', event.originalEvent.movementX )
        //     document.documentElement.style.setProperty('--moveY', event.originalEvent.movementY )
        //     console.log(event)
        //     // document.documentElement.style.setProperty('--x', event.clientX)
        //     // document.documentElement.style.setProperty('--y', event.clientY)
        //     // $(this).prop('style', `top:${event.pageY}px;left:${event.pageX}`)
        // })

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
                $('#el-tabs-content').children().hide()
                // Populate the element config tab based on type
                if ( tab.id === 'el-tab-conf') {
                    advElTab(node)
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

        uibuilder.doTooltips('#ti-edit-panel') // Do this at the end
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

    //#region ---- Validation functions ---- //

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

    //#endregion ---- Validation functions ---- //

    RED.nodes.registerType(moduleName, {
        defaults: {
            name: { value: '' },
            topic: { value: '' },

            elementtype: { value: 'table', required: true },

            parent: { value: 'body', validate: (v) => tiValidateOptString(v, 'parent', false, false) },
            parentSource: { value: '' }, // ! only here to allow for migration to parentSource field - remove after go-live of v6.1
            parentSourceType: { value: 'str' },

            elementid: { value: '', validate: (v) => tiValidateOptString(v, 'elementid', true, false) },
            elementId: { value: '' }, // ! TODO remove after go-live 6.1
            elementIdSourceType: { value: 'str' },

            heading: { value: '', validate: (v) => tiValidateOptString(v, 'heading', true, false) },
            headingSourceType: { value: 'str' },
            headingLevel: { value: 'h2', required: true },

            data: { value: 'payload' },
            dataSourceType: { value: 'msg' },

            position: { value: 'last', validate: (v) => tiValidateOptString(v, 'position', false, true) },
            positionSourceType: { value: 'str' },

            passthrough: { value: false },

            // Configuration data specific to the chosen type
            confData: { value: {} },
        },
        align: 'left',
        inputs: 1,
        inputLabels: '',
        outputs: 1,
        outputLabels: ['uibuilder dynamic UI configuration'],
        icon: 'pencilBoxMultipleWhite.svg',
        label: function () {
            return this.name || `[${this.elementtype}] ${this.parent ? `${this.parent}.` : ''}${this.elementid || moduleName}`
        },
        paletteLabel: moduleName,
        category: uibuilder.paletteCategory,
        color: 'var(--uib-node-colour)', // '#E6E0F8'

        /** Prepares the Editor panel */
        oneditprepare: function () { onEditPrepare(this) },

        /** Runs before save (Actually when Done button pressed) - oneditsave */
        oneditsave: function () { onEditSave(this) },

        /** Runs before cancel - oneditcancel */
        /** Handle window resizing for the editor - oneditresize */
        /** Show notification warning before allowing delete - oneditdelete */
    }) // ---- End of registerType() ---- //
}())
