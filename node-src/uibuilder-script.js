    /* eslint-env browser */
    /* global $,RED */
    // @ts-check
    'use strict'

    /** Module name must match this nodes html file @constant {string} moduleName */
    var moduleName  = 'uibuilder'

    /** placeholder for url duplicate check - marks url invalid/valid on change */
    var urlIsDup = false

    /** placeholder for ACE editor vars - so that they survive close/reopen admin config ui
     * @typedef uiace
     * @type {Object}
     * @property {string} format
     * @property {string} folder
     * @property {string} fname
     */
    var uiace = {
        'format': 'html',
        'folder': 'src',
        'fname' : 'index.html'
    }

    /** AddItem function for package list
     * @param {JQuery<HTMLElement>} element the jQuery DOM element to which any row content should be added
     * @param {number} index the index of the row
     * @param {*} data data object for the row. {} if add button pressed, else data passed to addItem method
     */
    function addPackageRow(element,index,data) {
        var hRow = ''
        if (Object.entries(data).length === 0) {
            // Add button was pressed so we have no packageName, create an input form instead
            hRow='<input type="text" id="packageList-input-' + index + '"> <button id="packageList-button-' + index + '">Install</button>'
        } else {
            // addItem method was called with a packageName passed
            hRow = data
        }
        // Build the output row
        $('<div class="packageList-row-data">'+hRow+'</div>').appendTo(element)
        // Create a button click listener for the install button for this row
        $('#packageList-button-' + index).click(function(){
            console.log('.packageList-row-data button::click', $('#packageList-input-' + index).val() )
            // TODO Call the npm installPackage API (it updates the package list)
            // TODO If successful, 
            //   TODO change the row, remove input field & button
            //   TODO Add to local package list (saves a call to the api)
            // TODO otherwise highlight input
        })
    }

    /** Get full package list via API and show in admin ui
     * param {string} url 
     * param {boolean} rebuild - Rebuild the vendorPaths list
     */
    function packageList() {
        $.getJSON('uibvendorpackages', function(vendorPaths) {
            console.log('uibuilder:packageList:uibvendorpackages', vendorPaths)

            $('#node-input-packageList').editableList('empty');

            const pkgList = Object.keys(vendorPaths)
            pkgList.forEach(function(packageName,index){
                $('#node-input-packageList').editableList('addItem',packageName)
            })
        })
    } // --- End of packageList --- //

    /** Return a file type from a file name (or default to txt)
     *  ftype can be used in ACE editor modes */
    function fileType(fname) {
        const fparts = fname.split('.')
        if (fparts.length > 1) {
            let ftype = 'text'
            const fext = fparts[1].toLowerCase().trim()
            switch (fext) {
                case 'js':
                    ftype = 'javascript'
                    break
                case 'html':
                case 'css':
                case 'json':
                    ftype = fext
                    break
                case 'vue':
                    ftype = 'html'
                    break
                case 'md':
                    ftype = 'markdown'
                    break
                case 'yaml':
                case 'yml':
                    ftype = 'yaml'
                    break
                default:
                    // txt
            }
            return ftype
        } else {
            return 'text'
        }
    } // --- End of fileType --- //

    /** Get the list of files for the chosen url & folder
     * @param {string} [selectedFile] Optional. If present will select this filename after refresh, otherwise 1st file is selected.
     */
    function getFileList(selectedFile) {
        $('#node-input-filename option').remove()

        var url = $('#node-input-url').val()
        var folder = $('#node-input-folder').val()

        // Build the file list - pass the url so the BE can find the right folder
        $.getJSON('uibfiles?url=' + url + '&folder=' + folder, function(files) {
            var firstFile = '', indexHtml = false, selected = false

            $.each(files, function (i, fname) {
                // Choose the default file. In order: selectedFile param, index.html, 1st returned
                if ( i === 0 ) firstFile = fname
                if ( fname === 'index.html' ) indexHtml = true
                if ( fname === selectedFile ) selected = true
                // Build the drop-down
                $('#node-input-filename').append($('<option>', { 
                    value: fname,
                    text : fname, 
                }))
            })

            //console.log( '[uibuilder:getFileList:getJSON] Got files ', files, firstFile, folder, url )

            // Set default file name/type. In order: selectedFile param, index.html, 1st returned
            if ( selected === true ) uiace.fname = selectedFile
            else if ( indexHtml === true ) uiace.fname = 'index.html'
            else uiace.fname = firstFile
            $('#node-input-filename').val(uiace.fname)
            uiace.format = firstFile === '' ? 'text' : fileType(firstFile)
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error( '[uibuilder:getFileList:getJSON] Error ' + textStatus, errorThrown )
            uiace.fname = ''
            uiace.format = 'text'
        }).always(function() {
            getFileContents()
            fileIsClean(true)
        })
    }

    /** Get the chosen file contents & set up the ACE editor */
    function getFileContents() {
        /** Get the chosen folder name - use the default/last saved on first load 
         * @type {string} */ 
         // @ts-ignore
        const folder = $('#node-input-folder').val() || uiace.folder 
        /** Get the chosen filename - use the default/last saved on first load 
         * @type {string} */
         // @ts-ignore
        const fname = $('#node-input-filename').val() || uiace.fname
        // Get the current url
        const url = $('#node-input-url').val()

        //console.log( '[uibuilder:getFileContents] ', url, folder, fname )

        // Save the file & folder names
        uiace.folder = folder
        uiace.fname = fname

        // Change mode to match file type
        const filetype = fname === '' ? 'text' : fileType(fname)
        $("#node-input-format").val(filetype)

        // Get the file contents via API defined in uibuilder.js
        $.get( 'uibgetfile?url=' + url + '&fname=' + fname + '&folder=' + folder, function(data){
            //console.log( '[uibuilder:getFileContents:get] Success. ', url, folder, fname )
            // Add the fetched data to the editor
            uiace.editorSession.setValue(data)
            // Set the editor file mode
            uiace.editorSession.setMode({
                path: 'ace/mode/' + filetype, v: Date.now()
            })
            // Mark the current session as clean
            uiace.editorSession.getUndoManager().isClean()
            // Position the cursor in the edit area
            uiace.editor.focus()
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error( '[uibuilder:getFileContents:get] Error ' + textStatus, errorThrown )
            uiace.editorSession.setValue('')
        })
    } // --- End of getFileContents --- //

    /** Call admin API to create a new file 
     * @param {string} fname Name of new file to create (combines with current selected folder and the current uibuilder url)
     * @return {string} Status message
     * 
     */
    function createNewFile(fname) {
        // Also get the current folder & url
        const folder = $('#node-input-folder').val() || uiace.folder
        const url = $('#node-input-url').val()

        const apiUrl = 'uibnewfile?url=' + url + '&fname=' + fname + '&folder=' + folder

        $.get( apiUrl, function(data){
            // Rebuild the file list & select the file
            getFileList(fname)

            return 'Create file succeeded'
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error( '[uibuilder:createNewFile:get] Error ' + textStatus, errorThrown )
            return 'Create file failed'
        })
    } // --- End of createNewFile --- //

    /** Call admin API to delete the currently selected file 
     * @return {string} Status message
     */
    function deleteFile() {
        // Get the current file, folder & url
        const fname = $('#node-input-filename').val()
        const folder = $('#node-input-folder').val()
        const url = $('#node-input-url').val()

        const apiUrl = 'uibdeletefile?url=' + url + '&fname=' + fname + '&folder=' + folder

        $.get( apiUrl, function(data){
            // Rebuild the file list & select the file
            getFileList(fname)

            return 'Delete file succeeded'
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error( '[uibuilder:deleteFile:get] Error ' + textStatus, errorThrown )
            return 'Delete file failed'
        })
    } // --- End of deleteFile --- //

    /** Enable/disable buttons if file has edits or not
     * @param {boolean} isClean true = the file is clean, else there are pending edits that need saving
     */
    function fileIsClean(isClean) {
        // If clean, disable the save & reset buttons
        $('#edit-save').prop('disabled', isClean)
        $('#edit-reset').prop('disabled', isClean)
        // If clean, enable the delete and edit buttons
        //$('#edit-delete').prop('disabled', !isClean)
        $('#edit-close').prop('disabled', !isClean)
        $('#node-edit-file').prop('disabled', !isClean)
        $('#node-input-filename').prop('disabled', !isClean)
        // If not clean, disable main Done and Cancel buttons to prevent loss
        $('#node-dialog-ok').prop('disabled', !isClean)
        $('#node-dialog-cancel').prop('disabled', !isClean)
        // If not clean, Add a user hint
        if ( ! isClean ) {
            $('#file-action-message').text('Save Required')
            $('#node-dialog-ok').css( 'cursor', 'not-allowed' )
            $('#node-dialog-cancel').css( 'cursor', 'not-allowed' )
        } else {
            $('#node-dialog-ok').css( 'cursor', 'pointer' )
            $('#node-dialog-cancel').css( 'cursor', 'pointer' )
        }
    } // --- End of fileIsClean --- //

    /** Validation Function: Validate the url property
     * Max 20 chars, can't contain any of ['..', ]
     * @param {*} value The url value to validate
     * @returns {boolean} true = valid
     **/
    function validateUrl(value){
        // NB: `this` is the node instance configuration as at last press of Done
        // TODO: Add display comment to help user

        // Max 20 chars
        if ( value.length > 20 ) return false
        // Cannot contain ..
        if ( value.indexOf('..') !== -1 ) return false
        // cannot contain / or \
        if ( value.indexOf('/') !== -1 ) return false
        if ( value.indexOf('\\') !== -1 ) return false
        // Cannot start with _ or .
        if ( value.substring(0,1) === '_' ) return false
        if ( value.substring(0,1) === '.' ) return false
        // Cannot be 'templates' as this is a reserved value (for v2)
        if ( value.toLowerCase().substring(0,9) === 'templates' ) return false

        // Initial flow run and Initial load of admin config ui - don't check for dups as it always will be
        if ( value === this.url ) return true
        
        // Check whether the url is already in use via a call to the admin API `uibindex`
        var exists = false
        $.ajax({
            dataType: 'json', async: false, 
            url: 'uibindex?check=' + value,
            success: function(check) {
                exists = check
            }
        })

        /** If the url already exists - prevent the "Done" button from being pressed. */
         // @ts-ignore ts(2367)
        if ( exists === true ) {
            $('#node-dialog-ok').prop('disabled', true)
            $('#node-dialog-ok').css( 'cursor', 'not-allowed' )
            return false
        } else {
            $('#node-dialog-ok').prop('disabled', false)
            $('#node-dialog-ok').css( 'cursor', 'pointer' )
            return true
        }

    } // --- End of validateUrl --- //

    // Register the node type, defaults and set up the edit fns 
     //@ts-ignore 
    RED.nodes.registerType('uibuilder', {
        category: 'UI Builder',
        color: '#E6E0F8',
        defaults: {
            name: { value: '' },
            topic: { value: '' },
            url: { value: 'uibuilder', required: true, validate: validateUrl },
            fwdInMessages: { value: false },   // Should we send input msg's direct to output as well as the front-end?
            allowScripts: { value: false },    // Should we allow msg's to send JavaScript to the front-end?
            allowStyles: { value: false },     // Should we allow msg's to send CSS styles to the front-end?
            copyIndex: { value: true },        // Should the default template files be copied to the instance src folder?
        },
        inputs: 1,
        inputLabels: 'Msg to send to front-end',
        outputs: 2,
        outputLabels: ['Data from front-end', 'Control Msgs from front-end'],
        icon: 'ui_template.png',
        paletteLabel: 'UI Builder',
        label: function () { return this.url || this.name || 'UI Builder'; },

        oneditprepare: function () {
            const that = this

            //#region Start with the edit section hidden & main section visible
            $('#main-props').show()
            $('#edit-props').hide()
            $('#npm-props').hide()
            $('#adv-props').hide()
            $('#info-props').hide()
            //#endregion

            //#region Set the checkbox states
            $('#node-input-fwdInMessages').prop('checked', this.fwdInMessages)
            $('#node-input-allowScripts').prop('checked', this.allowScripts)
            $('#node-input-allowStyles').prop('checked', this.allowStyles)
            $('#node-input-debugFE').prop('checked', this.debugFE)
            $('#node-input-copyIndex').prop('checked', this.copyIndex)
            // Show the uibuilder global settings from settings.js
            // TODO Fix for updated settings
            //$('#bedebug').text(RED.settings.uibuilder.debug)
            //#endregion checkbox states

            //#region Setup the package list
            $('#node-input-packageList').editableList({
                addItem: addPackageRow,
                removeItem: function(data){},
                resizeItem: function(row,index) {},
                header: $('<div>').append('<h4 style="display: inline-grid">Installed Packages</h4>'),
                height: 'auto',
                addButton: true,
                removable: true,
                scrollOnAdd: true,
                sortable: false,
            })

            /** Initialise default values for package list
             * NOTE: This is build dynamically each time the edit panel is opened
             *       we are not saving this since external changes would result in
             *       users having being prompted to deploy even when they've made
             *       no changes themselves to a node instance.
             */
            packageList()
            //#endregion

            // When the url changes (NB: Also see the validation function)
            $('#node-input-url').change(function () {
                // Show the root URL
                 // @ts-ignore Cannot find name 'RED'.ts(2304)
                $('#uibuilderurl').empty().append('<a href="' + RED.settings.httpNodeRoot + $(this).val() + '">' + RED.settings.httpNodeRoot + $(this).val() + '</a>')
            })

            // Show/Hide the advanced settings
            $('#show-adv-props').css( 'cursor', 'pointer' )
            $('#show-adv-props').click(function(e) {
                $('#adv-props').toggle()
                if ( $('#adv-props').is(':visible') ) {
                    $('#show-adv-props').html('<i class="fa fa-caret-down"></i> Advanced Settings')
                } else {
                    $('#show-adv-props').html('<i class="fa fa-caret-right"></i> Advanced Settings')
                }
            })
            // Show/Hide the Path & Module details
            $('#show-info-props').css( 'cursor', 'pointer' )
            $('#show-info-props').click(function(e) {
                $('#info-props').toggle()
                if ( $('#info-props').is(':visible') ) {
                    $('#show-info-props').html('<i class="fa fa-caret-down"></i> Path &amp; Module Details')
                } else {
                    $('#show-info-props').html('<i class="fa fa-caret-right"></i> Path &amp; Module Details')
                }
            })

            //#region ---- File Editor ---- //
            // Mark edit save/reset buttons as disabled by default
            fileIsClean(true)

            // Show the edit section, hide the main & adv sections
            $('#show-edit-props').click(function(e) {
                e.preventDefault() // don't trigger normal click event
                $('#main-props').hide()
                $('#adv-props').hide()
                $('#show-adv-props').html('<i class="fa fa-caret-right"></i> Advanced Settings')
                $('#edit-props').show()

                // Make the horizontal separator draggable
                $('#node-input-template-editor').resizable({
                    'handles': 's'
                })
                $('#node-input-template-editor > div.ui-resizable-handle.ui-resizable-s').css({
                    'height': '25px',
                    'bottom': '-25px'
                }
                )

                // @since 2019-01-27 - adding file editor
                // Build the file list
                getFileList()

                if ( uiace.editorLoaded !== true ) {
                    // Clear out the editor
                        // @ts-ignore ts(2367)
                    if ($('#node-input-template').val('') !== '') $('#node-input-template').val('')

                    // Create the ACE editor component
                        //@ts-ignore Cannot find name 'RED'.ts(2304)
                    uiace.editor = RED.editor.createEditor({
                        id: 'node-input-template-editor',
                        mode: 'ace/mode/' + uiace.format,
                        value: that.template
                    })
                    // Keep a reference to the current editor session
                    uiace.editorSession = uiace.editor.getSession()
                    /** If the editor has changes, enable the save & reset buttons
                     * using input event instead of change since it's called with some timeout 
                     * which is needed by the undo (which takes some time to update)
                     **/
                    uiace.editor.on("input", function() {
                        // Is the editor clean?
                        fileIsClean(uiace.editorSession.getUndoManager().isClean())
                    })
                    /*uiace.editorSession.on('change', function(delta) {
                        // delta.start, delta.end, delta.lines, delta.action
                        console.log('ACE Editor CHANGE Event', delta)
                    }) */
                    uiace.editorLoaded = true

                    // Be friendly and auto-load the initial file via the admin API
                    getFileContents()
                    fileIsClean(true)
                }
            })

            // Hide the edit section, show the main section
            $('#edit-close').click(function(e) {
                e.preventDefault() // don't trigger normal click event
                $('#main-props').show()
                $('#edit-props').hide()
            })

            // Handle the file editor change of folder/file
            $('#node-input-folder').change(function(e) {
                // Rebuild the file list
                getFileList()
            })
            $('#node-input-filename').change(function(e) {
                // Get the content of the file via the admin API
                getFileContents()
                fileIsClean(true)
            })
            // Handle the file editor reset button (reload the file)
            $('#edit-reset').click(function(e) {
                e.preventDefault() // don't trigger normal click event

                // Get the content of the file via the admin API
                getFileContents()
                fileIsClean(true)
                $('#file-action-message').text('')
            })
            // Handle the file editor save button
            $('#edit-save').click(function(e) {
                e.preventDefault() // don't trigger normal click event

                var authTokens = RED.settings.get('auth-tokens')
                console.log(RED.settings.get("auth-tokens"))

                // Post the updated content of the file via the admin API
                // NOTE: Cannot use jQuery POST function as it sets headers that trigger a CORS error. Do it using native requests only.
                var request = new XMLHttpRequest()
                var params = 'fname=' + $('#node-input-filename').val() + '&folder=' + $('#node-input-folder').val() + 
                    '&url=' + $('#node-input-url').val() + '&data=' + encodeURIComponent(uiace.editorSession.getValue())
                request.open('POST', 'uibputfile', true)
                request.onreadystatechange = function() {
                    if (this.readyState === XMLHttpRequest.DONE) {
                        if (this.status === 200) {
                            // Request successful
                            // display msg - blank msg when new edits present
                            $('#file-action-message').text('File Saved')
                            fileIsClean(true)
                        } else {
                            // Request failed
                            // display msg - blank msg when new edits present
                            $('#file-action-message').text('File Save FAILED')
                        }
                    }
                }
                request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
                // If admin ui is protected with a login, we need to send the access token
                if (authTokens) request.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
                request.send(params)

            })

            //#region Handle the Delete file button
            $('#edit_delete_dialog').dialog({
                autoOpen:false, modal:true, closeOnEscape:true,
                buttons: [
                    {
                        text: 'Delete',
                        id: 'edit_del_dialog_del',
                        click: function() {
                            // Call the delete file API (uses the current file)
                            deleteFile()
                            $( this ).dialog( 'close' )
                        }
                    },{
                        text: 'Cancel',
                        click: function() {
                            $( this ).dialog( 'close' )
                        }
                    },
                ]
            })
            $('#edit-delete').click(function(e) {
                $('#edit_del_dialog_del').addClass('input-error').css('color','brown')
                $('#edit-delete-name').text($('#node-input-folder').val() + '/' + $('#node-input-filename').val())
                $('#edit_delete_dialog').dialog('open')  
            })
            //#endregion

            //#region Handle the New file button
            $('#edit_new_dialog_new').addClass('input-error').prop('disabled',true)
            $('#edit-input-newname').addClass('input-error').on('input', function(){
                if ( $('#edit-input-newname').val().length === 0) {
                    $('#edit-input-newname').addClass('input-error')
                    $('#edit_new_dialog_new').addClass('input-error').prop('disabled',true)
                } else {
                    $('#edit-input-newname').removeClass('input-error')
                    $('#edit_new_dialog_new').removeClass('input-error').prop('disabled',false)
                }
            })
            $('#edit_new_dialog').dialog({
                autoOpen:false, modal:true, closeOnEscape:true,
                buttons: [
                    {
                        text: 'New',
                        id: 'edit_new_dialog_new',
                        click: function() {
                            // NB: Button is disabled unless name.length > 0 so don't need to check here
                            // Call the new file API
                            createNewFile($('#edit-input-newname').val())
                            $('#edit-input-newname').val(null).addClass('input-error')
                            $('#edit_new_dialog_new').addClass('input-error').prop('disabled',true)
                            $( this ).dialog( 'close' )
                        }
                    },{
                        text: 'Cancel',
                        click: function() {
                            $('#edit-input-newname').val(null).addClass('input-error')
                            $('#edit_new_dialog_new').addClass('input-error').prop('disabled',true)
                            $( this ).dialog( 'close' )
                        }
                    },
                ]
            })
            $('#edit-new').click(function(e) {
                $('#edit_new_dialog').dialog('open')  
            })
            //#endregion

            // Handle the expander button (show full screen editor) - from core function node
            $('#node-function-expand-js').click(function(e) {
                e.preventDefault()
                var value = uiace.editor.getValue()
                //@ts-ignore Cannot find name 'RED'.ts(2304)
                RED.editor.editJavaScript({
                    value: value,
                    width: 'Infinity',
                    cursor: uiace.editor.getCursorPosition(),
                    mode: 'ace/mode/' + uiace.format,
                    complete: function(v,cursor) {
                        uiace.editor.setValue(v, -1)
                        uiace.editor.gotoLine(cursor.row+1,cursor.column,false)
                        setTimeout(function() {
                            uiace.editor.focus()
                        },300)
                    }
                })
            })
            //#endregion ---- File Editor ---- //

            //#region ---- npm ---- //
            $('#npm-response').hide()
            /** @type {string[]} */
            var npmMsg = []
            // NB: Assuming that the edit section is closed
            // Show the npm section, hide the main & adv sections
            $('#show-npm-props').click(function(e) {
                e.preventDefault() // don't trigger normal click event
                $('#main-props').hide()
                $('#adv-props').hide()
                $('#show-adv-props').html('<i class="fa fa-caret-right"></i> Advanced Settings')
                $('#npm-props').show()

                packageList()
            })
            // Hide the npm section, show the main section
            $('#npm-close').click(function(e) {
                e.preventDefault() // don't trigger normal click event

                // Empty the msgbox & hide it
                $('#npm-response').html('').hide()

                $('#main-props').show()
                $('#npm-props').hide()
            })
            // Run the install command
            $('#npm-install').click(function(e) {
                e.preventDefault() // don't trigger normal click event

                // Empty the msgbox & hide it
                $('#npm-response').html('').hide(); npmMsg = []

                // If packagename empty, don't bother
                var packageName = $('#npm-package-name').val()
                if ( packageName !== '' ) {
                    $.get( 'uibnpm?cmd=install&package=' + packageName , function(data){ // + '&url=' + url
                        console.log( '[uibuilder:npm-install:get] Success. Package: ', packageName, data )
                        if (data.check.package_exists === false) {
                            npmMsg.push('Requested package could not be installed.')
                        } else {
                            npmMsg.push('Package added.')
                        }
                        // TODO Add to .settings.json
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        console.error( '[uibuilder:npm-remove:get] Package:' + packageName + '. Error ' + textStatus, errorThrown )
                        npmMsg.push('Error returned: ' + textStatus)
                    }).always(function(){
                        $('#npm-response').html('<p>' + npmMsg.join('<br>') + '</p>').show()
                        packageList() // refresh the package list    
                    })
            }
            })
            // Run the remove command
            $('#npm-remove').click(function(e) {
                e.preventDefault() // don't trigger normal click event

                // Empty the msgbox & hide it
                $('#npm-response').html('').hide(); npmMsg = []

                // If packagename empty, don't bother
                var packageName = $('#npm-package-name').val()
                if ( packageName !== '' ) {
                    $.get( 'uibnpm?cmd=remove&package=' + packageName , function(data){ // + '&url=' + url
                        console.log( '[uibuilder:npm-remove:get] Success. Package: ', packageName, data )
                        if (data.check.package_exists === false) {
                            npmMsg.push('Requested package does not exist.')
                        } else {
                            npmMsg.push('Package removed.')
                        }
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        console.error( '[uibuilder:npm-remove:get] Package:' + packageName + '. Error ' + textStatus, errorThrown )
                        npmMsg.push('Error returned: ' + textStatus)
                    }).always(function(){
                        $('#npm-response').html('<p>' + npmMsg.join('<br>') + '</p>').show()
                        packageList() // refresh the package list    
                    })
            }
            })
            //#endregion ---- npm ---- //

            /** TODO: Get list of installed ACE themes, add chooser, save current choice
             * that.editor.setTheme("ace/theme/monokai")
             * uiace.config.set("basePath", "https://url.to.a/folder/that/contains-ace-modes");
             * uiace.config.setModuleUrl("ace/theme/textmate", "url for textmate.js");
             **/

        }, // ---- End of oneditprepare ---- //

        oneditsave: function() {
            // xfer the editor text back to the template var
            //$('#node-input-template').val(this.editor.getValue())
            // Get rid of the editor
            if ( uiace.editorLoaded === true ) {
                uiace.editor.destroy()
                delete uiace.editor
                uiace.editorLoaded = false
            }
        },

        oneditcancel: function() {
            // Get rid of the editor
            if ( uiace.editorLoaded === true ) {
                uiace.editor.destroy()
                delete uiace.editor
                uiace.editorLoaded = false
            }
        },

        /** Handle window resizing for the editor */
        oneditresize: function(size) {
            //console.log('RESIZE', size)
            if ( uiace.editorLoaded === true ) {
                /**
                 * #node-input-template-editor
                 * #editor-stack > div > div.editor-tray-body-wrapper > div > div:nth-child(2) > div:nth-child(1)
                 *    .editor-tray-content
                 */
                /** Tries to make sure the editor+other visible components don't overflow (cause scroll) 
                 * Limited by min-height.
                */
                var rows = $('#dialog-form>div:not(.node-text-editor-row)')
                var height = $('#dialog-form').height()
                for (var i=0; i<rows.length; i++) {
                    height -= $(rows[i]).outerHeight(true)
                }
                var editorRow = $("#dialog-form>div.node-text-editor-row")
                height -= (parseInt(editorRow.css("marginTop"))+parseInt(editorRow.css("marginBottom")))
                //$('.node-text-editor').css('height',height+'px')
                $('#node-input-template-editor').css('height',height+'px')
                uiace.editor.resize()
            }
        },
    })
