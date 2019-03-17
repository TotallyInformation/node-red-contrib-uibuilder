    /** Module name must match this nodes html file @constant {string} moduleName */
    var moduleName  = 'uibuilder'

    /** placeholder for url duplicate check - marks url invalid/valid on change */
    var urlIsDup = false

    /** placeholder for ACE editor vars - so that they survive close/reopen admin config ui */
    var uiace = {
        'format': 'html',
        'folder': 'src',
        'fname' : 'index.html'
    }

    /** Get full package list via API and show in admin ui
     * @param {string} url 
     * @param {boolean} rebuild - Rebuild the vendorPaths list
     */
    function packageList() {
        $.getJSON('uibvendorpackages', function(vendorPackages) {
            console.log('uibuilder:packageList:uibvendorpackages', vendorPackages)
            //$('#installed-packages').text( Object.keys(vendorPackages) )
            $('#installed-packages').empty()
            $.each(vendorPackages, function(package, pkgInfo) {
                $('#installed-packages').append('<li><i>' + package + '</i></li>')
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
                    break;
                case 'html':
                case 'css':
                case 'json':
                    ftype = fext
                    break;
                case 'vue':
                    ftype = 'html'
                    break;
                case 'md':
                    ftype = 'markdown'
                    break;
                case 'yaml':
                case 'yml':
                    ftype = 'yaml'
                    break;
                default:
                    // txt
            }
            return ftype
        } else {
            return 'text'
        }
    } // --- End of fileType --- //

    /** Get the list of files for the chosen url & folder */
    function getFileList() {
        $("#node-input-filename option").remove()

        var url = $('#node-input-url').val()
        var folder = $('#node-input-folder').val()

        // Build the file list - pass the url so the BE can find the right folder
        $.getJSON('uibfiles?url=' + url + '&folder=' + folder, function(files) {
            var firstFile = ''

            $.each(files, function (i, fname) {
                // Choose the default file
                if ( i === 0 ) firstFile = fname
                if ( fname === 'index.html' ) firstFile = fname
                // Build the drop-down
                $('#node-input-filename').append($('<option>', { 
                    value: fname,
                    text : fname, 
                }))
            })

            //console.log( '[uibuilder:getFileList:getJSON] Got files ', files, firstFile, folder, url )

            // Set default file name/type
            uiace.fname = firstFile
            $("#node-input-filename").val(uiace.fname)
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

    /** Get the chosen file contents & set up the ACE editor
     * @param {Object} that - 'this' for the oneditprepare function
     **/
    function getFileContents() {
        // Get the chosen folder name - use the default/last saved on first load
        const folder = $('#node-input-folder').val() || uiace.folder
        // Get the chosen filename - use the default/last saved on first load
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
            dataType: "json", async: false, 
            url: 'uibindex?check=' + value,
            success: function(check) {
                exists = check
            }
        })

        // If the url already exists - prevent the "Done" button from being pressed.
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
            debugFE: { value: false },         // Should debug be turned on in the uibuilderfe library?
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

            // Start with the edit section hidden & main section visible
            $('#main-props').show()
            $('#edit-props').hide()
            $('#npm-props').hide()
            $('#adv-props').hide()
            $('#info-props').hide()

            // Set the checkbox states
            $('#node-input-fwdInMessages').prop('checked', this.fwdInMessages)
            $('#node-input-allowScripts').prop('checked', this.allowScripts)
            $('#node-input-allowStyles').prop('checked', this.allowStyles)
            $('#node-input-debugFE').prop('checked', this.debugFE)
            $('#node-input-copyIndex').prop('checked', this.copyIndex)
            // Show the uibuilder global settings from settings.js
            // TODO Fix for updated settings
            //$('#bedebug').text(RED.settings.uibuilder.debug)

            // When the url changes (NB: Also see the validation function)
            $('#node-input-url').change(function () {
                // Show the root URL
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
            // Show/Hide the Path & Module info
            $('#show-info-props').css( 'cursor', 'pointer' )
            $('#show-info-props').click(function(e) {
                $('#info-props').toggle()
                if ( $('#info-props').is(':visible') ) {
                    $('#show-info-props').html('<i class="fa fa-caret-down"></i> Path &amp; Module Info')
                } else {
                    $('#show-info-props').html('<i class="fa fa-caret-right"></i> Path &amp; Module Info')
                }
            })

            // List the front-end url paths available (shown in info box)
            //packageList(this.url, true)

            //#region ---- File Editor ---- //
                // Delete is not ready yet, so disable button by default. TODO
                $('#edit-delete').prop('disabled', true)
                // Mark edit save/reset buttons as disabled by default
                fileIsClean(true)

                // Show the edit section, hide the main & adv sections
                $('#show-edit-props').click(function(e) {
                    e.preventDefault() // don't trigger normal click event
                    $('#main-props').hide()
                    $('#adv-props').hide()
                    $('#show-adv-props').html('<i class="fa fa-caret-right"></i> Advanced Settings')
                    $('#edit-props').show()

                    // @since 2019-01-27 - adding file editor
                    // Build the file list
                    getFileList()

                    if ( uiace.editorLoaded !== true ) {
                        // Clear out the editor
                        if ($('#node-input-template').val('') !== '') $('#node-input-template').val('')

                        // Create the ACE editor component
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

                    // Force change event on filename
                    //$('#node-input-filename').change()
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

                    // Post the updated content of the file via the admin API
                    // NOTE: Cannot use jQuery POST function as it sets headers that trigger a CORS error. Do it using native requests only.
                    var request = new XMLHttpRequest()
                    var params = 'fname=' + $('#node-input-filename').val() + '&url=' + $('#node-input-url').val() + '&data=' + encodeURIComponent(uiace.editorSession.getValue())
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
                    request.send(params)

                })

                // Handle the expander button (show full screen editor) - from core function node
                $("#node-function-expand-js").click(function(e) {
                    e.preventDefault();
                    var value = uiace.editor.getValue();
                    RED.editor.editJavaScript({
                        value: value,
                        width: "Infinity",
                        cursor: uiace.editor.getCursorPosition(),
                        mode: 'ace/mode/' + uiace.format,
                        complete: function(v,cursor) {
                            uiace.editor.setValue(v, -1);
                            uiace.editor.gotoLine(cursor.row+1,cursor.column,false);
                            setTimeout(function() {
                                uiace.editor.focus();
                            },300);
                        }
                    })
                })
            //#endregion ----  ---- //

            //#region ---- npm ---- //
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
                    $('#main-props').show()
                    $('#npm-props').hide()
                })

            //#endregion ----  ---- //

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
                var rows = $("#dialog-form>div:not(.node-text-editor-row)");
                var height = $("#dialog-form").height();
                for (var i=0; i<rows.size(); i++) {
                    height -= $(rows[i]).outerHeight(true);
                }
                var editorRow = $("#dialog-form>div.node-text-editor-row");
                height -= (parseInt(editorRow.css("marginTop"))+parseInt(editorRow.css("marginBottom")));
                $(".node-text-editor").css("height",height+"px");
                uiace.editor.resize();
            }
        },
    })
