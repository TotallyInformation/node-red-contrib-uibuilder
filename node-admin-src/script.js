    'use strict'

    /** @typedef {import("node-red").Red} Red */

    //#region --------- "global" variables for the panel --------- //

    /** Module name must match this nodes html file @constant {string} moduleName */
    var moduleName  = 'uibuilder'
    /** Node's label @constant {string} paletteCategory */
    var nodeLabel  = 'UI Builder'
    /** Node's palette category @constant {string} paletteCategory */
    var paletteCategory  = 'UI Builder'
    /** Node's background color @constant {string} paletteColor */
    var paletteColor  = '#E6E0F8'

    /** placeholder for ACE editor vars - so that they survive close/reopen admin config ui
     * @typedef uiace
     * @type {Object}
     * @property {string} format
     * @property {string} folder
     * @property {string} fname
     * @property {boolean} fullscreen Is the editor in fullscreen mode?
     */
    var uiace = {
        'format': 'html',
        'folder': 'src',
        'fname' : 'index.html',
        'fullscreen': false
    }

    //#endregion ------------------------------------------------- //

    //#region --------- "global" functions for the panel --------- //

    /** AddItem function for package list
     * @param {JQuery<HTMLElement>} element the jQuery DOM element to which any row content should be added
     * @param {number} index the index of the row
     * @param {string|*} data data object for the row. {} if add button pressed, else data passed to addItem method
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
        var myRow = $('<div id="packageList-row-' + index + '" class="packageList-row-data">'+hRow+'</div>').appendTo(element)

        // Create a button click listener for the install button for this row
        $('#packageList-button-' + index).click(function(){
            //console.log('.packageList-row-data button::click', $('#packageList-input-' + index).val() )

            // show activity spinner
            $('i.spinner').show()
            
            var packageName = '' + $('#packageList-input-' + index).val()

            if ( packageName.length !== 0 ) {
                /** @type {Red} */
                RED.notify('Installing npm package ' + packageName)

                // Call the npm installPackage API (it updates the package list)
                $.get( 'uibnpmmanage?cmd=install&package=' + packageName, function(data){
                    //console.log('.packageList-row-data get::uibnpmmanage', data )

                    if ( data.success === true) {
                        RED.notify('Successful installation of npm package ' + packageName, 'success')
                        console.log('[uibuilder:addPackageRow:get] PACKAGE INSTALLED. ', packageName)

                        // Replace the input field with the normal package name display
                        myRow.html(packageName)
                    } else {
                        RED.notify('FAILED installation of npm package ' + packageName, 'error')
                        console.log('[uibuilder:addPackageRow:get] ERROR ON INSTALLATION OF PACKAGE ', packageName )
                        console.dir( data.result )
                    }

                    // Hide the progress spinner
                    $('i.spinner').hide()

                }).fail(function(_jqXHR, textStatus, errorThrown) {
                    RED.notify('FAILED installation of npm package ' + packageName, 'error')
                    console.error( '[uibuilder:addPackageRow:get] Error ' + textStatus, errorThrown )

                    $('i.spinner').hide()
                    return 'addPackageRow failed'
                    // TODO otherwise highlight input
                })
            } // else Do nothing

        }) // -- end of button click -- //

    } // --- End of addPackageRow() ---- //

    /** RemoveItem function for package list */
    function removePackageRow(packageName) {
        //console.log('[uibuilder:removePackageRow] PACKAGE NAME: ', packageName)

        // If package name is an empty object - user removed an add row so ignore
        if ( (packageName === '') || (typeof packageName !== 'string') ) {
            return false
        }

        RED.notify('Starting removal of npm package ' + packageName)
        // show activity spinner
        $('i.spinner').show()

        // Call the npm installPackage API (it updates the package list)
        $.get( 'uibnpmmanage?cmd=remove&package=' + packageName, function(data){
            //console.log('[uibuilder:removePackageRow:get::uibnpmmanage] ', data )

            if ( data.success === true) {
                RED.notify('Successfully uninstalled npm package ' + packageName, 'success')
                console.log('[uibuilder:removePackageRow:get] PACKAGE REMOVED. ', packageName)
            } else {
                RED.notify('FAILED to uninstall npm package ' + packageName, 'error')
                console.log('[uibuilder:removePackageRow:get] ERROR ON PACKAGE REMOVAL ', data.result )
                // Put the entry back again
                $('#node-input-packageList').editableList('addItem',packageName)
            }

            $('i.spinner').hide()

        }).fail(function(_jqXHR, textStatus, errorThrown) {
            RED.notify('FAILED to uninstall npm package ' + packageName, 'error')
            console.error( '[uibuilder:removePackageRow:get] Error ' + textStatus, errorThrown )
            
            // Put the entry back again
            $('#node-input-packageList').editableList('addItem',packageName)

            $('i.spinner').hide()
            return 'removePackageRow failed'
            // TODO otherwise highlight input
        })
        
    } // ---- End of removePackageRow ---- //

    /** Get full package list via API and show in admin ui
     * param {string} url 
     * param {boolean} rebuild - Rebuild the vendorPaths list
     */
    function packageList() {
        $.getJSON('uibvendorpackages', function(vendorPaths) {
            //console.log('uibuilder:packageList:uibvendorpackages', vendorPaths)

            $('#node-input-packageList').editableList('empty')

            var pkgList = Object.keys(vendorPaths)
            pkgList.forEach(function(packageName,_index){
                if ( packageName !== 'socket.io' )
                    $('#node-input-packageList').editableList('addItem',packageName)
            })
        })
    } // --- End of packageList --- //

    /** Return a file type from a file name (or default to txt)
     *  ftype can be used in ACE editor modes */
    function fileType(fname) {
        var fparts = fname.split('.')
        if (fparts.length > 1) {
            var ftype = 'text'
            var fext = fparts[1].toLowerCase().trim()
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

        // Whether or not to force the index.(html|js|css) files to be copied over if missing
        var nodeInputCopyIndex = $('#node-input-copyIndex').is(':checked')

        // Build the file list - pass the url so the BE can find the right folder
        $.getJSON('uibfiles?url=' + url + '&folder=' + folder + '&cpyIdx=' + nodeInputCopyIndex, function(files) {
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
        }).fail(function(_jqXHR, textStatus, errorThrown) {
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
        var folder = $('#node-input-folder').val() || uiace.folder 
        /** Get the chosen filename - use the default/last saved on first load 
         * @type {string} */
         // @ts-ignore
        var fname = $('#node-input-filename').val() || uiace.fname
        // Get the current url
        var url = $('#node-input-url').val()

        //console.log( '[uibuilder:getFileContents] ', url, folder, fname )

        // Save the file & folder names
        uiace.folder = folder
        uiace.fname = fname

        // Change mode to match file type
        var filetype = fname === '' ? 'text' : fileType(fname)
        $('#node-input-format').val(filetype)

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
        }).fail(function(_jqXHR, textStatus, errorThrown) {
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
        var folder = $('#node-input-folder').val() || uiace.folder
        var url = $('#node-input-url').val()

        var apiUrl = 'uibnewfile?url=' + url + '&fname=' + fname + '&folder=' + folder

        $.get( apiUrl, function(_data){
            // Rebuild the file list & select the file
            getFileList(fname)

            return 'Create file succeeded'
        }).fail(function(_jqXHR, textStatus, errorThrown) {
            console.error( '[uibuilder:createNewFile:get] Error ' + textStatus, errorThrown )
            return 'Create file failed'
        })
    } // --- End of createNewFile --- //

    /** Call admin API to delete the currently selected file 
     * @return {string} Status message
     */
    function deleteFile() {
        // Get the current file, folder & url
        var fname = $('#node-input-filename').val()
        var folder = $('#node-input-folder').val()
        var url = $('#node-input-url').val()

        var apiUrl = 'uibdeletefile?url=' + url + '&fname=' + fname + '&folder=' + folder

        $.get( apiUrl, function(_data){
            // Rebuild the file list & select the file
            getFileList(fname)

            return 'Delete file succeeded'
        }).fail(function(_jqXHR, textStatus, errorThrown) {
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
    function validateUrl(value) {
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

    /** Set the height of the ACE text editor box */
    function setACEheight() {
        var height

        if ( uiace.editorLoaded === true ) {
            // If the editor is in full-screen ...
            if (document.fullscreenElement) {
                // Force background color and add some padding to keep away from edge
                $('#edit-props').css('background-color','#f6f6f6').css('padding','1em')

                // Start to calculate the available height and adjust the editor to fill the ht
                height = parseInt($('#edit-props').css('height')) // full available height
                height -= 25

                // Replace the expand icon with a compress icon
                $('#node-function-expand-js').css('background-color','black').html('<i class="fa fa-compress"></i>')

                uiace.fullscreen = true

                //console.log('Entered full-screen mode. Element: ', document.fullscreenElement.id, height)

            } else {
                $('#edit-props').css('background-color','').css('padding','')

                // Full height
                height = parseInt($('#dialog-form').height())
                // Subtract info lines
                height -= parseInt($('#info').height())
                
                // Replace the compress icon with a expand icon
                $('#node-function-expand-js').css('background-color','').html('<i class="fa fa-expand"></i>')

                uiace.fullscreen = false
                
                //console.log('Leaving full-screen mode.', height)
                
            }
            
            // everything but the edit box
            var rows = $('#edit-props > div:not(.node-text-editor-row)')

            // subtract height of each row from the total
            for (var i=0; i<rows.length; i++) {
                height -= $(rows[i]).outerHeight(true)
            }

            // Set the height of the edit box
            $('#node-input-template-editor').css('height',height+'px')

            // Get the content to match the edit box size
            uiace.editor.resize()

        }

    } // --- End of setACEheight --- //

    //#endregion ------------------------------------------------- //

    // Register the node type, defaults and set up the edit fns 
     //@ts-ignore 
    RED.nodes.registerType(moduleName, {
        category: paletteCategory,
        color: paletteColor,
        defaults: {
            name: { value: '' },
            topic: { value: '' },
            url: { value: 'uibuilder', required: true, validate: validateUrl },
            fwdInMessages: { value: false },   // Should we send input msg's direct to output as well as the front-end?
            allowScripts: { value: false },    // Should we allow msg's to send JavaScript to the front-end?
            allowStyles: { value: false },     // Should we allow msg's to send CSS styles to the front-end?
            copyIndex: { value: true },        // Should the default template files be copied to the instance src folder?
            showfolder: { value: false },      // Should a web index view of all source files be made available?
        },
        inputs: 1,
        inputLabels: 'Msg to send to front-end',
        outputs: 2,
        outputLabels: ['Data from front-end', 'Control Msgs from front-end'],
        icon: 'ui_template.png',
        paletteLabel: nodeLabel,
        label: function () { return this.url || this.name || nodeLabel },

        /** Prepares the Editor panel */
        oneditprepare: function () {
            var that = this

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
            $('#node-input-copyIndex').prop('checked', this.copyIndex)
            //#endregion checkbox states

            // When the url changes (NB: Also see the validation function)
            $('#node-input-url').change(function () {
                // Show the root URL
                 // @ts-ignore Cannot find name 'RED'.ts(2304)
                $('#uibuilderurl').empty().append('<a href="' + RED.settings.httpNodeRoot + $(this).val() + '" target="_blank">' + RED.settings.httpNodeRoot + $(this).val() + '</a>')
                $('#node-input-showfolder-url').empty().append('<a href="' + RED.settings.httpNodeRoot + $(this).val() + '/idx" target="_blank">' + RED.settings.httpNodeRoot + $(this).val() + '/idx</a>')
            })

            // Show/Hide the advanced settings
            $('#show-adv-props').css( 'cursor', 'pointer' )
            $('#show-adv-props').click(function(_e) {
                $('#adv-props').toggle()
                if ( $('#adv-props').is(':visible') ) {
                    $('#show-adv-props').html('<i class="fa fa-caret-down"></i> Advanced Settings')
                } else {
                    $('#show-adv-props').html('<i class="fa fa-caret-right"></i> Advanced Settings')
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
                })

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
                    uiace.editor.on('input', function() {
                        // Is the editor clean?
                        fileIsClean(uiace.editorSession.getUndoManager().isClean())
                    })
                    /*uiace.editorSession.on('change', function(delta) {
                        // delta.start, delta.end, delta.lines, delta.action
                        console.log('ACE Editor CHANGE Event', delta)
                    }) */
                    uiace.editorLoaded = true

                    // Resize to max available height
                    setACEheight()
                    
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
            $('#node-input-folder').change(function(_e) {
                // Rebuild the file list
                getFileList()
            })
            $('#node-input-filename').change(function(_e) {
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
            $('#edit-delete').click(function(_e) {
                $('#edit_del_dialog_del').addClass('input-error').css('color','brown')
                $('#edit-delete-name').text($('#node-input-folder').val() + '/' + $('#node-input-filename').val())
                if ( $('#node-input-folder').val() === 'src' ) {
                    if ( $('#node-input-copyIndex').is(':checked') ) {
                        $('#edit-delete-recopy').css('color','').text('Copy flag is set so index.(html|js|css) files will be recopied from master template.')
                    } else {
                        $('#edit-delete-recopy').css('color','brown').text('Copy flag is NOT set so index.(html|js|css) files will NOT be recopied from master template.')
                    }    
                } else {
                    $('#edit-delete-recopy').css('color','').text('')
                }
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
                        text: 'Create',
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
            $('#edit-new').click(function(_e) {
                $('#edit_new_dialog').dialog('open')  
            })
            //#endregion

            // Handle the expander button (show full screen editor) - from core function node
            $('#node-function-expand-js').click(function(e) {
                e.preventDefault()

                // Are we in fullscreen? Variable is updated when oneditresize calls setACEheight()
                if (uiace.fullscreen === false) {
                    // Select the editor components and make full-screen, triggers oneditresize()
                    var viewer = $('#edit-props')[0]
                    var rFS = viewer.requestFullscreen || viewer.mozRequestFullScreen || viewer.webkitRequestFullscreen || viewer.msRequestFullScreen
                    if (rFS) rFS.call(viewer)
                    
                    // TODO: Add popup if no method is available
                } else {
                    // Already in fullscreen so lets exit, triggers oneditresize()
                    document.exitFullscreen()
                }

            })
            //#endregion ---- File Editor ---- //

            //#region ---- npm ---- //
            // NB: Assuming that the edit section is closed
            // Show the npm section, hide the main & adv sections
            $('#show-npm-props').click(function(e) {
                e.preventDefault() // don't trigger normal click event
                $('#main-props').hide()
                $('#adv-props').hide()
                $('#show-adv-props').html('<i class="fa fa-caret-right"></i> Advanced Settings')
                $('#npm-props').show()

                // TODO Improve feedback
                //#region Setup the package list
                $('#node-input-packageList').editableList({
                    addItem: addPackageRow, // function
                    removeItem: removePackageRow, // function(data){},
                    resizeItem: function(_row,_index) {},
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

                // spinner
                $('.red-ui-editableList-addButton').after(' <i class="spinner"></i>')
                $('i.spinner').hide()
                //#endregion --- package list ---- //

            })
            // Hide the npm section, show the main section
            $('#npm-close').click(function(e) {
                e.preventDefault() // don't trigger normal click event

                $('#main-props').show()
                $('#npm-props').hide()
            })
            //#endregion ---- npm ---- //

            /** TODO: Get list of installed ACE themes, add chooser, save current choice
             * that.editor.setTheme("ace/theme/monokai")
             * uiace.config.set("basePath", "https://url.to.a/folder/that/contains-ace-modes");
             * uiace.config.setModuleUrl("ace/theme/textmate", "url for textmate.js");
             **/

        }, // ---- End of oneditprepare ---- //

        /** Runs before save */
        oneditsave: function() {
            // xfer the editor text back to the template var
            //$('#node-input-template').val(this.editor.getValue())
            // Get rid of the editor
            if ( uiace.editorLoaded === true ) {
                uiace.editor.destroy()
                delete uiace.editor
                uiace.editorLoaded = false
            }
        }, // ---- End of oneditsave ---- //

        /** Runs before cancel */
        oneditcancel: function() {
            // Get rid of the editor
            if ( uiace.editorLoaded === true ) {
                uiace.editor.destroy()
                delete uiace.editor
                uiace.editorLoaded = false
            }
        }, // ---- End of oneditcancel ---- //

        /** Handle window resizing for the editor */
        oneditresize: function(_size) {
            console.log('RESIZE', _size)

            setACEheight()

        }, // ---- End of oneditcancel ---- //

    }) // ---- End of registerType() ---- //
