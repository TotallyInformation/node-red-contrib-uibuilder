/* globals JQuery */
/* eslint-disable strict */
// Isolate this code
(function () {
    'use strict'

    /** Typedefs
     * typedef {import("node-red").EditorRED} Red
     * typedef {import("node-red__editor-client").RED} RED
     */

    //#region ------------------- Pollyfills --------------------- //
    if (!Object.entries)
        Object.entries = function( obj ){
            var ownProps = Object.keys( obj ),
                i = ownProps.length,
                resArray = new Array(i) // preallocate the Array
            while (i--)
                resArray[i] = [ownProps[i], obj[ownProps[i]]]

            return resArray
        }
    //#endregion ----------------- Pollyfills -------------------- //

    //#region --------- "global" variables for the panel --------- //

    /** Module name must match this nodes html file @constant {string} moduleName */
    var moduleName  = 'uibuilder'
    /** Node's label @constant {string} paletteCategory */
    var nodeLabel  = 'uibuilder'
    /** Node's palette category @constant {string} paletteCategory */
    var paletteCategory  = 'uibuilder'
    /** Node's background color @constant {string} paletteColor */
    var paletteColor  = '#E6E0F8'
    /** Default session length (in seconds) if security is active @type {Number} */
    var defaultSessionLength = 432000
    /** Default JWT secret if security is active - to ensure it isn't blank @type {String} */
    var defaultJwtSecret = 'Replace This With A Real Secret'
    /** List of installed packages - rebuilt when editor is opened, updates by library mgr */
    var packages = []
    /** Default template name */
    var defaultTemplate = 'blank'

    /** placeholder for ACE editor vars - so that they survive close/reopen admin config ui
     * @typedef {object} uiace Options for the ACE/Monaco code editor
     * @property {string} format What format to use for the code editor (html)
     * @property {string} folder What folder was last used
     * @property {string} fname What filename was last edited
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
     * @param {object} node A reference to the panel's `this` object
     * @param {JQuery<HTMLElement>} element the jQuery DOM element to which any row content should be added
     * @param {number} index the index of the row
     * @param {string|*} data data object for the row. {} if add button pressed, else data passed to addItem method
     */
    function addPackageRow(node, element, index, data) {
        var hRow = ''

        if (Object.entries(data).length === 0) {
            // Add button was pressed so we have no packageName, create an input form instead
            hRow  = `<input type="text" id="packageList-input-${index}" title="">`
            hRow += `<select id="pkg-sel-${index}" title="">`
            hRow += '<option value="common" selected>Common Install</option>'
            hRow += '<option value="local">Local Install</option>'
            hRow += `</select> <button id="packageList-button-${index}">Install</button>`
            hRow += '<div class="form-tips">Enter one of: (a) an npm package name (optionally with leading scope and/or trailing version), (b) a GitHub user/repo (with optional branch spec), (c) A filing system path to a local package. Select where to install.</div>'
        } else {
            // addItem method was called with a packageName passed
            hRow = data
        }
        // Build the output row
        var myRow = $('<div id="packageList-row-' + index + '" class="packageList-row-data">'+hRow+'</div>').appendTo(element)

        if (Object.entries(data).length === 0) {
            // Add a tooltip
            // @ts-expect-error ts(2339)
            $(`#packageList-input-${index}`).tooltip({
                content: 'Enter one of:<ul><li>An npm package name (optionally with leading scope and/or trailing version)</li><li>A GitHub user/repo (with optional branch spec)</li><li>A filing system path to a local package</li></ul>'
            })
            // @ts-expect-error ts(2339)
            $(`#pkg-sel-${index}`).tooltip({
                content: 'Install for:<ul><li>All uibuilder instances (common)</li><lI>Just for this one (local)</li></ul>'
            })
        }

        // Create a button click listener for the install button for this row
        $('#packageList-button-' + index).on('click', function(){
            // show activity spinner
            $('i.spinner').show()
            
            var packageName = String($('#packageList-input-' + index).val())
            var packageLoc = String($('#pkg-sel-' + index).val())

            if ( packageName.length !== 0 ) {
                console.log( '>>', packageName, packageLoc )
                
                RED.notify('Installing npm package ' + packageName)

                // Call the npm installPackage API (it updates the package list)
                $.get( `uibuilder/uibnpmmanage?cmd=install&package=${packageName}&url=${node.url}&loc=${packageLoc}`, function(data){

                    if ( data.success === true) {
                        console.log('[uibuilder:addPackageRow:get] PACKAGE INSTALLED. ', packageName, packageLoc, node.url)
                        RED.notify(`Successful installation of npm package ${packageName} in ${packageLoc} for ${node.url}`, 'success')

                        // Replace the input field with the normal package name display
                        myRow.html(packageName)

                        // Update the master package list
                        packages.push(packageName)
                    } else {
                        console.log('[uibuilder:addPackageRow:get] ERROR ON INSTALLATION OF PACKAGE ', packageName, packageLoc, node.url )
                        console.dir( data.result )
                        RED.notify(`FAILED installation of npm package ${packageName} in ${packageLoc} for ${node.url}`, 'error')
                    }

                    // Hide the progress spinner
                    $('i.spinner').hide()

                })
                    .fail(function(_jqXHR, textStatus, errorThrown) {
                        console.error( '[uibuilder:addPackageRow:get] Error ' + textStatus, errorThrown )
                        RED.notify(`FAILED installation of npm package ${packageName} in ${packageLoc} for ${node.url}`, 'error')

                        $('i.spinner').hide()
                        return 'addPackageRow failed'
                        // TODO otherwise highlight input
                    })
            } // else Do nothing

        }) // -- end of button click -- //

    } // --- End of addPackageRow() ---- //

    /** RemoveItem function for package list
     * @param {string} packageName Name of the npm package to remove
     * @returns {string} Result text
     */
    function removePackageRow(packageName) {

        // If package name is an empty object - user removed an add row so ignore
        if ( (packageName === '') || (typeof packageName !== 'string') ) {
            return 'No package'
        }

        RED.notify('Starting removal of npm package ' + packageName)
        // show activity spinner
        $('i.spinner').show()

        // Call the npm installPackage API (it updates the package list)
        $.get( 'uibuilder/uibnpmmanage?cmd=remove&package=' + packageName, function(data){

            if ( data.success === true) {
                console.log('[uibuilder:removePackageRow:get] PACKAGE REMOVED. ', packageName)
                RED.notify('Successfully uninstalled npm package ' + packageName, 'success')
                
                // Remove the entry from the master package list
                const i = packages.indexOf(packageName)
                if ( i > 0 ) packages.splice(i,1)
            } else {
                console.log('[uibuilder:removePackageRow:get] ERROR ON PACKAGE REMOVAL ', data.result )
                RED.notify('FAILED to uninstall npm package ' + packageName, 'error')
                // Put the entry back again
                // @ts-ignore
                $('#node-input-packageList').editableList('addItem',packageName)
            }

            $('i.spinner').hide()

        })
            .fail(function(_jqXHR, textStatus, errorThrown) {
                console.error( '[uibuilder:removePackageRow:get] Error ' + textStatus, errorThrown )
                RED.notify('FAILED to uninstall npm package ' + packageName, 'error')
                
                // Put the entry back again
                // @ts-ignore
                $('#node-input-packageList').editableList('addItem',packageName)

                $('i.spinner').hide()
                return 'removePackageRow failed'
                // TODO otherwise highlight input
            })
        
    } // ---- End of removePackageRow ---- //

    /** Get list of installed packages via API - save to master list
     * @param {string} url Used to find locally install packages for this node from uibRoot/url/
     */
    function packageList(url) {
        $.ajax({
            dataType: 'json',
            method: 'get',
            url: `uibuilder/uibvendorpackages?url=${url}`,
            async: false,
            //data: { url: node.url},
            success: function(vendorPaths) {
                packages = []
                var pkgList = Object.keys(vendorPaths)
                console.log('>> Packages >> ', vendorPaths)
                // eslint-disable-next-line no-unused-vars
                pkgList.forEach(function(packageName,_index){
                    // Populate the master package list (used to check dependencies)
                    packages.push(packageName)
                })
            }
        })

        // $.getJSON('uibvendorpackages', function(vendorPaths) {
        //     packages = []
        //     var pkgList = Object.keys(vendorPaths)
        //     console.log('>> Packages >> ', vendorPaths)
        //     // eslint-disable-next-line no-unused-vars
        //     pkgList.forEach(function(packageName,_index){
        //         // Populate the master package list (used to check dependencies)
        //         packages.push(packageName)
        //     })
        // })
    } // --- End of packageList --- //

    /** Return a file type from a file name (or default to txt)
     *  ftype can be used in ACE editor modes
     * @param {string} fname File name for which to return the type
     * @returns {string} File type
     */
    function fileType(fname) {
        let ftype = 'text'
        let fparts = fname.split('.')
        // Take off the first entry if the file name started with a dot
        if ( fparts[0] === '' ) fparts.shift()
        if (fparts.length > 1) {
            // Get the last element of the array
            // eslint-disable-next-line newline-per-chained-call
            let fext = fparts.pop().toLowerCase().trim()
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
                    ftype = fext
            }
        }
        return ftype
    } // --- End of fileType --- //

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

    /** Get the chosen file contents & set up the ACE editor */
    function getFileContents() {
        // Get the current url
        var url = $('#node-input-url').val()

        /** Get the chosen folder name - use the default/last saved on first load 
         * @type {string} */ 
        // @ts-ignore
        var folder = $('#node-input-folder').val()
        if ( folder === null ) 
            folder = localStorage.getItem('uibuilder.'+url+'.folder') || uiace.folder 
        /** Get the chosen filename - use the default/last saved on first load 
         * @type {string} */
        // @ts-ignore
        var fname = $('#node-input-filename').val()
        if ( fname === null ) 
            fname = localStorage.getItem('uibuilder.'+url+'.selectedFile') || uiace.fname 

        // Save the file & folder names
        uiace.folder = folder
        uiace.fname = fname

        // Persist the folder & file name selection
        localStorage.setItem('uibuilder.'+url+'.folder', uiace.folder)
        localStorage.setItem('uibuilder.'+url+'.selectedFile', uiace.fname)

        // Change mode to match file type
        var filetype = uiace.format = fileType(fname)
        $('#node-input-format').val(filetype)

        // Get the file contents via API defined in uibuilder.js
        $.get( 'uibuilder/uibgetfile?url=' + url + '&fname=' + fname + '&folder=' + folder, function(data){
            $('#node-input-template-editor').show()
            $('#node-input-template-editor-no-file').hide()
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

        })
            .fail(function(_jqXHR, textStatus, errorThrown) {
                console.error( '[uibuilder:getFileContents:get] Error ' + textStatus, errorThrown )
                uiace.editorSession.setValue('')
                $('#node-input-template-editor').hide()
                $('#node-input-template-editor-no-file').show()

            })
            .always(function(){
                fileIsClean(true)
                // Default the language selector in case it wasn't recognised
                if(!$('#node-input-format option:selected').length) $('#node-input-format').val('text')
            })
    } // --- End of getFileContents --- //

    /** Get the list of files for the chosen url & folder
     * @param {string} [selectedFile] Optional. If present will select this filename after refresh, otherwise 1st file is selected.
     */
    function getFileList(selectedFile) {
        //#region --- Collect variables from Config UI ---
        var url = /** @type {string} */ ($('#node-input-url').val())
        var folder = /** @type {string} */ ($('#node-input-folder').val())
        var f = /** @type {string} */ ($('#node-input-filename').val())
        
        // Whether or not to force the index.(html|js|css) files to be copied over if missing
        //var nodeInputCopyIndex = $('#node-input-copyIndex').is(':checked')
        //#endregion -------------------------------------

        // Collect the current filename from various places
        if ( selectedFile === undefined ) selectedFile = /** @type {string} */ (f)
        if ( selectedFile === null ) 
            selectedFile = localStorage.getItem('uibuilder.'+url+'.selectedFile') || undefined

        if ( folder === null ) 
            folder = localStorage.getItem('uibuilder.'+url+'.folder') || undefined

        // Clear out drop-downs ready for rebuilding
        $('#node-input-filename option').remove()
        $('#node-input-folder option').remove()

        // Get all files/folders for this uibuilder instance from API call
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: './uibuilder/admin/' + url,
            data: {
                'cmd': 'listall',
            },
        })
            // eslint-disable-next-line no-unused-vars
            .done(function(data, _textStatus, jqXHR) {
                let firstFile = '', indexHtml = false, selected = false

                // build folder list, pre-select src if no current folder selected #node-input-folder - Object.keys(res)
                const folders = Object.keys(data).sort()

                // Rebuild folder drop-down
                $.each(folders, function (i, fldrname) {
                    // For the root folder, use empty string for folders lookup but "root" for display
                    if ( fldrname === '' ) fldrname = 'root'
                    // Build the drop-down
                    $('#node-input-folder').append($('<option>', { 
                        value: fldrname,
                        text : fldrname, 
                    }))
                })
                // if currently selected folder doesn't exist
                if ( !data[folder] ) {
                    // Use 'src' if it exists otherwise use 'root'
                    if ( data.src ) folder = 'src'
                    else folder = 'root'
                }
                // Selected folder
                $('#node-input-folder').val(folder)
                uiace.folder = folder
                // Persist the folder selection
                localStorage.setItem('uibuilder.'+url+'.folder', folder)

                let files = []
                files = data[folder]
                
                $.each(files, function (i, filename) {
                    // Build the drop-down
                    $('#node-input-filename').append($('<option>', { 
                        value: filename,
                        text : filename, 
                    }))
                    // Choose the default file. In order: selectedFile param, index.html, 1st returned
                    if ( i === 0 ) firstFile = filename
                    if ( filename === uiace.fname ) indexHtml = true
                    if ( filename === selectedFile ) selected = true
                })
                // Set default file name/type. In order: selectedFile param, index.html, 1st returned
                // @ts-ignore
                if ( selected === true ) uiace.fname = selectedFile
                // @ts-ignore
                else if ( indexHtml === true ) uiace.fname = 'index.html'
                else uiace.fname = firstFile
                $('#node-input-filename').val(uiace.fname)
                uiace.format = fileType(uiace.fname)
                // Persist the file name selection
                localStorage.setItem('uibuilder.'+url+'.selectedFile', uiace.fname)

            })
            .fail(function(jqXHR, textStatus, errorThrown) {

                console.error( '[uibuilder:getFileList:getJSON] Error ' + textStatus, errorThrown )
                uiace.fname = ''
                uiace.format = 'text'
                RED.notify(`uibuilder: Folder and file listing error.<br>${errorThrown}`, {type:'error'})

            })
            .always(function() {
                getFileContents()
            })

    } // --- End of getFileList --- //

    /** Call v3 admin API to create a new folder 
     * @param {string} folder Name of new folder to create (combines with current uibuilder url)
     * returns {string} Status message
     */
    function createNewFolder(folder) {
        // Also get the current url
        var url = $('#node-input-url').val()

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: './uibuilder/admin/' + url,
            data: {
                'folder': folder,
                'cmd': 'newfolder',
            },
        })
            .done(function() { //data, textStatus, jqXHR) {
                RED.notify(`uibuilder: Folder <code>${folder}</code> Created.`, {type:'success'})
                // Rebuild the file list
                getFileList()

                return 'Create folder succeeded'
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                RED.notify(`uibuilder: Create Folder Error.<br>${errorThrown}`, {type:'error'})
                return 'Create folder failed'
            })
    } // --- End of createNewFile --- //

    /** Call v3 admin API to create a new file 
     * @param {string} fname Name of new file to create (combines with current selected folder and the current uibuilder url)
     * returns {string} Status message
     */
    function createNewFile(fname) {
        // Also get the current folder & url
        var folder = $('#node-input-folder').val() || uiace.folder
        var url = $('#node-input-url').val()

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: './uibuilder/admin/' + url,
            data: {
                'folder': folder,
                'fname': fname,
                'cmd': 'newfile',
            },
        })
            .done(function() { //data, textStatus, jqXHR) {
                RED.notify(`uibuilder: File <code>${folder}/${fname}</code> Created.`, {type:'success'})
                // Rebuild the file list
                getFileList(fname)

                return 'Create file succeeded'
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error( '[uibuilder:createNewFile:post] Error ' + textStatus, errorThrown )
                RED.notify(`uibuilder: Create File Error.<br>${errorThrown}`, {type:'error'})
                return 'Create file failed'
            })
    } // --- End of createNewFile --- //

    /** Call v3 admin API to delete the currently selected folder 
     * returns {string} Status message
     */
    function deleteFolder() {
        // Also get the current url & folder
        var url = $('#node-input-url').val()
        var folder = $('#node-input-folder').val()

        $.ajax({
            type: 'DELETE',
            dataType: 'json',
            url: './uibuilder/admin/' + url,
            data: {
                'folder': folder,
                'cmd': 'deletefolder',
            },
        })
            .done(function() { // data, textStatus, jqXHR) {
                RED.notify(`uibuilder: Folder <code>${folder}</code> deleted.`, {type:'success'})
                // Rebuild the file list
                getFileList()

                return 'Delete folder succeeded'
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error( '[uibuilder:deleteFolder:delete] Error ' + textStatus, errorThrown )
                RED.notify(`uibuilder: Delete Folder Error.<br>${errorThrown}`, {type:'error'})
                return 'Delete folder failed'
            })

    } // --- End of deleteFolder --- //

    /** Call v3 admin API to delete the currently selected file 
     * returns {string} Status message
     */
    function deleteFile() {
        // Get the current file, folder & url
        var folder = /** @type {string} */ ($('#node-input-folder').val()) || uiace.folder
        var url = /** @type {string} */ ($('#node-input-url').val())
        var fname = /** @type {string} */ ($('#node-input-filename').val())

        $.ajax({
            type: 'DELETE',
            dataType: 'json',
            url: './uibuilder/admin/' + url,
            data: {
                'folder': folder,
                'fname': fname,
                'cmd': 'deletefile',
            },
        })
            .done(function() { // data, textStatus, jqXHR) {
                RED.notify(`uibuilder: File <code>${folder}/${fname}</code> Deleted.`, {type:'success'})
                // Rebuild the file list
                getFileList(fname)

                return 'Delete file succeeded'
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error( '[uibuilder:deleteFile:delete] Error ' + textStatus, errorThrown )
                RED.notify(`uibuilder: Delete File Error.<br>${errorThrown}`, {type:'error'})
                return 'Delete file failed'
            })

    } // --- End of deleteFile --- //

    /** Validation Function: Validate the url property
     * Max 20 chars, can't contain any of ['..', ]
     * @param {*} value The url value to validate
     * @returns {boolean} true = valid
     **/
    function validateUrl(value) {
        // NB: `this` is the node instance configuration as at last press of Done
        //     Validation fns are run on every node instance when the Editor is loaded (value is populated but jQuery val is undefined).
        //     and again when the config panel is opened (because jquery change is fired. value, jquery val and this.url are all the same).

        /** If the url hasn't really changed - no need to validate but might need to allow Done (for other settings)
         * e.g. user changes is back after trying something different but didn't commit between
         * Initial flow run and Initial load of admin config ui - don't check for dups as it always will be a dup
         */
        if ( value === this.url ) {
            $('#node-dialog-ok').prop('disabled', false)
            $('#node-dialog-ok').css( 'cursor', 'pointer' )
            $('#node-dialog-ok').addClass('primary')
            return true
        }

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

        
        // Check whether the url is already in use via a call to the admin API
        var exists = false
        $.ajax({
            type: 'GET',
            async: false,
            dataType: 'json',
            url: './uibuilder/admin/' + value,
            data: {
                'cmd': 'checkurls',
            },
            success: function(check) {
                exists = check
            }
        })

        /** If the url already exists - prevent the "Done" button from being pressed. */
        // @ts-ignore
        if ( exists === true ) {
            $('#node-dialog-ok').prop('disabled', true)
            $('#node-dialog-ok').css( 'cursor', 'not-allowed' )
            $('#node-dialog-ok').removeClass('primary')
            RED.notify(`<b>ERROR</b>: <p>The chosen URL (${value}) is already in use (or the folder exists).<br>It must be changed before you can save/commit</p>`, {type: 'error'})
            return false
        }
        
        $('#node-dialog-ok').prop('disabled', false)
        $('#node-dialog-ok').css( 'cursor', 'pointer' )
        $('#node-dialog-ok').addClass('primary')

        // Warn user when changing URL. NOTE: Set/reset old url in the onsave function not here
        if ( value !== this.url )
            RED.notify(`<b>NOTE</b>: <p>You are renaming the url from ${this.url} to ${value}.<br>You <b>MUST</b> redeploy before doing anything else.</p>`, {type: 'warning'})

        return true
        

    } // --- End of validateUrl --- //

    /** Set the height of the ACE text editor box */
    function setACEheight() {
        let height

        if ( uiace.editorLoaded === true ) {
            // If the editor is in full-screen ...
            if (document.fullscreenElement) {
                // Force background color and add some padding to keep away from edge
                $('#edit-props').css('background-color','#f6f6f6')
                    .css('padding','1em')

                // Start to calculate the available height and adjust the editor to fill the ht
                height = parseInt($('#edit-props').css('height'), 10) // full available height
                height -= 25

                // Replace the expand icon with a compress icon
                $('#node-function-expand-js').css('background-color','black')
                    .html('<i class="fa fa-compress"></i>')

                uiace.fullscreen = true

            } else {
                // Don't bother if the top of the editor is still auto
                if ( $('#edit-outer').css('top') === 'auto' ) return

                $('#edit-props').css('background-color','')
                    .css('padding','')

                height = ($('.red-ui-tray-footer').position()).top - ($('#edit-outer').offset()).top - 35
                
                // Replace the compress icon with a expand icon
                $('#node-function-expand-js').css('background-color','')
                    .html('<i class="fa fa-expand"></i>')

                uiace.fullscreen = false
                
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

    /** Validation Function: Validate the session length property
     * If security is on, must contain a number
     * @returns {boolean} true = valid, false = not valid
     **/
    function validateSessLen() {
        // NB: `this` is the node instance configuration as at last press of Done
        // TODO: Add display comment to help user

        var newVal = $('#node-input-sessionLength').val()
        var newSec = $('#node-input-useSecurity').is(':checked')

        if (newSec === true && (newVal.toString()).length < 1 ) return false

        return true

    } // --- End of validateSessLen --- //

    /** Validation Function: Validate the jwtSecret property
     * If security is on, must contain text
     * @returns {boolean} true = valid, false = not valid
     **/
    function validateSecret() { // eslint-disable-line no-unused-vars
        // NB: `this` is the node instance configuration as at last press of Done
        // TODO: Add display comment to help user

        var newVal = $('#node-input-jwtSecret').val()
        var newSec = $('#node-input-useSecurity').is(':checked')

        if (newSec === true && (newVal.toString()).length < 1 ) return false

        return true

    } // --- End of validateSecret --- //

    /** Populate the template selection dropdown
     * Uses a file that is `require`d in uibuilder.js
     * @param {object} node Pass in this
     * @returns {string} Template folder name
     */
    function populateTemplateDropdown(node) {
        let templateFolder = node.templateFolder
        let uibuilderTemplates = []

        if ( RED.settings && RED.settings.uibuilderTemplates ) {
            uibuilderTemplates = RED.settings.uibuilderTemplates
        } else {
            console.error(`[uibuilder:populateTemplateDropdown] Cannot access RED.settings for node ${node.id}`)
        }

        // Load each option - first entry will be the default
        Object.values(uibuilderTemplates).forEach( templ => { // eslint-disable-line es/no-object-values
            // Build the drop-down
            $('#node-input-templateFolder').append($('<option>', { 
                value: templ.folder,
                text : templ.name, 
            }))
        })

        // Just in case name doesn't exist in template list, default to blank
        if ( ! uibuilderTemplates[templateFolder] ) {
            templateFolder = defaultTemplate
        }

        $(`#node-input-templateFolder option[value="${templateFolder}"]`).prop('selected', true)
        $('#node-input-templateFolder').val(templateFolder)

        // 1st entry is default - populate the description help tip
        $('#node-templSel-info').text(uibuilderTemplates[templateFolder].description)

        return templateFolder
    } // --- end of function populateTemplateDropdown --- //

    /** Check whether the currently selected template's npm dependencies are installed
     * If not, warn the user to install them.
     */
    function checkDependencies() {
        const folder = /** @type {string} */ ($('#node-input-templateFolder').val())

        if ( ! RED.settings.uibuilderTemplates[folder] ) {
            console.error(`[uibuilder:checkDependencies] Template name not found: ${folder}`)
            return
        }

        const deps = RED.settings.uibuilderTemplates[folder].dependencies || []
        const missing = []

        deps.forEach( depName => {
            if ( ! packages.includes(depName) ) missing.push(depName)
        })

        if ( missing.length > 0 ) {
            var myNotification = RED.notify(`WARNING<br /><br />The selected uibuilder template (${folder}) is MISSING the following dependencies:<div> ${missing.join(', ')}</div><br />Please install them using the uibuilder Library Manager or select a different template.`,{
                type: 'warning',
                modal: true,
                fixed: true,
                buttons: [
                    {
                        text: 'OK',
                        class:'primary',
                        click: function() { // (e) {
                            myNotification.close()
                        }
                    }
                ]
            })
        }

    } // --- end of function checkDependencies --- //

    /** Load a template */
    function loadTemplate() {
        // Get the current file, folder & url
        var template = $('#node-input-templateFolder').val()
        var extTemplate = $('#node-input-extTemplate').val()
        var url = $('#node-input-url').val()

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: './uibuilder/admin/' + url,
            data: {
                'template': template,
                'extTemplate': extTemplate,
                'cmd': 'replaceTemplate',
            },
        })
            .done(function(data, textStatus, jqXHR) {
                RED.notify(`<b>uibuilder</b>:<br><br>${jqXHR.statusText}<br>`, {type:'success'})
                return 'Template load succeeded'
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error( '[uibuilder:loadTemplate] Error ' + textStatus, errorThrown )
                RED.notify(`<b>uibuilder</b>:<br><br>Template Load Error.<br><br>${errorThrown}<br>`, {type:'error'})
                return 'Template load failed'
            })
    } // --- End of loadTemplate() --- //

    /** Load a new template */
    function btnTemplate() {

        // Check first
        var myNotification = RED.notify(
            `WARNING<br /><br />
            Are you <b>SURE</b> you want to overwrite your code
            with the template <b><code>${ $('#node-input-templateFolder').val() }</code></b>?<br /><br />
            <b>THIS CANNOT BE UNDONE.</b>`,
            {
                type: 'warning',
                modal: true,
                fixed: true,
                buttons: [
                    {
                        text: 'Cancel, don\'t overwrite',
                        class:'primary',
                        click: function() { // (e) {
                            myNotification.close()
                        }
                    },
                    {
                        text: 'OK, overwrite',
                        //class:"primary",
                        click: function() { // (e) {
                            loadTemplate()
                            myNotification.close()
                        }
                    }
                ]
            }
        )

    } // --- End of btnTemplate() --- //

    /** Set initial hidden & checkbox states (called from onEditPrepare)
     * @param {object} node A reference to the panel's `this` object
     */
    function setInitialStates(node) {
        // initial checkbox states
        $('#node-input-fwdInMessages').prop('checked', node.fwdInMessages)
        $('#node-input-allowScripts').prop('checked', node.allowScripts)
        $('#node-input-allowStyles').prop('checked', node.allowStyles)
        $('#node-input-copyIndex').prop('checked', node.copyIndex)
        $('#node-input-showfolder').prop('checked', node.showfolder)
        $('#node-input-useSecurity').prop('checked', node.useSecurity)
        $('#node-input-allowUnauth').prop('checked', node.allowUnauth)
        $('#node-input-tokenAutoExtend').prop('checked', node.tokenAutoExtend)
        $('#node-input-reload').prop('checked', node.reload)
    }

    /** Handle URL changes (called from onEditPrepare)
     * `this` is the selected jQuery object $('#node-input-url')
     */
    function urlChange() {

        var thisurl = $(this).val()
        var eUrlSplit = window.origin.split(':')
        //var nrPort = Number(eUrlSplit[2])
        var nodeRoot = RED.settings.httpNodeRoot.replace(/^\//, '')
        $('#info-webserver').empty()

        // Is uibuilder using a custom server?
        if (RED.settings.uibuilderCustomServer.port) {
            // Use the correct protocol (http or https)
            eUrlSplit[0] = RED.settings.uibuilderCustomServer.type.replace('http2','https')
            // Use the correct port
            eUrlSplit[2] = RED.settings.uibuilderCustomServer.port
            // When using custom server, no base path is used
            nodeRoot = ''
            $('#info-webserver')
                .append(`<div class="form-tips node-help">uibuilder is using a custom webserver at ${eUrlSplit.join(':') + '/'} </div>`)
        }

        var urlPrefix = eUrlSplit.join(':') + '/'
        // Show the root URL
        $('#uibuilderurl').prop('href', urlPrefix + nodeRoot + thisurl)
            .text('Open ' + nodeRoot + thisurl)
        $('#uibinstanceconf').prop('href', `./uibuilder/instance/${thisurl}?cmd=showinstancesettings`)
        // NB: The index url link is only shown if the option is turned on
        $('#show-src-folder-idx-url').empty()
            .append('<div>at <a href="' + urlPrefix + nodeRoot + $(this).val() + '/idx" target="_blank" class="red-ui-button">' + nodeRoot + $(this).val() + '/idx</a></div>')
    }

    /** Configure the template dropdown & setup button handlers (called from onEditPrepare)
     * @param {object} node A reference to the panel's `this` object
     */
    function templateSettings(node) {

        $('#adv-templ').hide()
        $('#show-templ-props').css( 'cursor', 'pointer' )
        $('#show-templ-props').on('click', function() { // (e) {
            $('#adv-templ').toggle()
            if ( $('#adv-templ').is(':visible') ) {
                $('#show-templ-props').html('<i class="fa fa-caret-down"></i> Template Settings')
            } else {
                $('#show-templ-props').html('<i class="fa fa-caret-right"></i> Template Settings')
            }
        })
        // Populate the template selection drop-down and select default (in advanced)
        populateTemplateDropdown(node)
        checkDependencies()
        // Unhide the external template name input if external selected
        if ( $('#node-input-templateFolder').val() === 'external' ) $('#et-input').show()
        // Handle change of template
        $('#node-input-templateFolder').on('change', function() { // (e) {
            // update the help tip
            if ( RED.settings.uibuilderTemplates[node.templateFolder] )
                $('#node-templSel-info').text(RED.settings.uibuilderTemplates[node.templateFolder].description)
            // Check if the dependencies are installed, warn if not
            checkDependencies()
            // Unhide the external template name input if external selected
            if ( $('#node-input-templateFolder').val() === 'external' )
                $('#et-input').show()
            else
                $('#et-input').hide()
        })
        // Button press for loading new template
        $('#btn-load-template').on('click', function(e){
            e.preventDefault() // don't trigger normal click event
            btnTemplate()
        })

    }

    /** Setup for security settings (called from onEditPrepare) */
    function securitySettings() {
        // Show/Hide the security settings
        $('#show-security-props').css( 'cursor', 'pointer' )
        $('#show-security-props').on('click', function() { // (e) {
            $('#sec-props').toggle()
            if ( $('#sec-props').is(':visible') ) {
                $('#show-security-props').html('<i class="fa fa-caret-down"></i> Security Settings')
            } else {
                $('#show-security-props').html('<i class="fa fa-caret-right"></i> Security Settings')
            }
        })

        // One-off check for default settings
        if ( /** @type {string} */ ($('#node-input-jwtSecret').val()).length === 0 ) {
            $('#node-input-jwtSecret').val(defaultJwtSecret)
        }
        if ( $('#node-input-useSecurity').is(':checked') && /** @type {string} */ ($('#node-input-sessionLength').val()).length === 0 ) {
            $('#node-input-sessionLength').val(defaultSessionLength)
        }

        // Security turning on/off
        $('#node-input-useSecurity').on('change', function() {

            // security is requested, enable other settings and add warnings if needed
            // @since v4.1.1 disable lockout of security for non-http in production
            /* 
                if ( this.checked ) {
                    // If in production, cannot turn on security without https, in dev, give a warning
                    if (window.location.protocol !== 'https' && window.location.protocol !== 'https:') {
                        if (RED.settings.uibuilderNodeEnv !== 'development') {
                            console.error('HTTPS NOT IN USE BUT SECURITY REQUESTED AND Node environment is NOT "development"')
                            $('#node-input-useSecurity').prop('checked', false); this.checked = false
                        } else {
                            console.warn('HTTPS NOT IN USE BUT SECURITY REQUESTED - Node environment is "development" so this is allowed but not recommended')
                        }
                        // TODO: Add user warnings
                    }
                }
            */
            // Yes, we do need this.checked twice :-)
            if ( $(this).is(':checked') ) {

                $('#node-input-allowUnauth').prop('disabled', false)        
                $('#node-input-sessionLength').prop('disabled', false)
                $('#node-input-jwtSecret').prop('disabled', false)
                $('#node-input-tokenAutoExtend').prop('disabled', false)
                // Add defaults if fields are empty
                if ( /** @type {string} */ ($('#node-input-jwtSecret').val()).length === 0 ) {
                    $('#node-input-jwtSecret').addClass('input-error')
                }
                if ( /** @type {string} */ ($('#node-input-sessionLength').val()).length === 0 ) {
                    $('#node-input-sessionLength').val(defaultSessionLength)
                }
                if ( /** @type {string} */ ($('#node-input-jwtSecret').val()).length === 0 ) {
                    $('#node-input-jwtSecret').val(defaultJwtSecret)
                }

            } else { // security not requested, disable other settings

                $('#node-input-allowUnauth').prop('disabled', true)        
                $('#node-input-sessionLength').prop('disabled', true)
                $('#node-input-jwtSecret').prop('disabled', true)
                $('#node-input-tokenAutoExtend').prop('disabled', true)

            }

        }) // -- end of security change -- //

        // What mode is Node-RED running in? development or something else?
        $('#nrMode').text(RED.settings.uibuilderNodeEnv)
        
    } // ---- end of securitySettings ---- //

    /** Prep tabs
     * @param {object} node A reference to the panel's `this` object
     */
    function prepTabs(node) {
        const tabs = RED.tabs.create({
            id: 'tabs',
            onchange: function(tab) {
                // Show only the content (i.e. the children) of the selected tabsheet, and hide the others
                $('#tabs-content').children().hide() // eslint-disable-line newline-per-chained-call
                $('#' + tab.id).show()

                //? Could move these to their own show event. Might even unload some stuff on hide?

                if ( tab.id === 'tab-files' ) {
                    // Build the file list
                    getFileList()

                    if ( uiace.editorLoaded !== true ) {
                        // @ts-expect-error ts(2352) Clear out the editor
                        if ( /** @type {string} */ ($('#node-input-template').val('')) !== '') $('#node-input-template').val('')

                        // Create the ACE editor component
                        uiace.editor = RED.editor.createEditor({
                            id: 'node-input-template-editor',
                            mode: 'ace/mode/' + uiace.format,
                            value: node.template
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
                } else if ( tab.id === 'tab-libraries' ) {

                    //! TODO Improve feedback

                    // Setup the package list
                    $('#node-input-packageList').editableList({
                        addItem: function addItem(element,index,data) {
                            addPackageRow(node, element,index, data)
                        },
                        removeItem: removePackageRow, // function(data){},
                        resizeItem: function() {}, // function(_row,_index) {},
                        header: $('<div>').append('<b>Installed Packages</b>'),
                        height: 'auto',
                        addButton: true,
                        removable: true,
                        scrollOnAdd: true,
                        sortable: false,
                    })

                    // reset and populate the list
                    $('#node-input-packageList').editableList('empty')
                    packages.forEach( packageName => {
                        if ( packageName !== 'socket.io' ) // ignore socket.io
                            $('#node-input-packageList').editableList('addItem',packageName)
                    })

                    // spinner
                    $('.red-ui-editableList-addButton').after(' <i class="spinner"></i>')
                    $('i.spinner').hide()

                }
            }
        })
        tabs.addTab({ id: 'tab-core',      label: 'Core'      })
        tabs.addTab({ id: 'tab-files',     label: 'Files'     })
        tabs.addTab({ id: 'tab-libraries', label: 'Libraries' })
        tabs.addTab({ id: 'tab-security',  label: 'Security'  })
        tabs.addTab({ id: 'tab-advanced',  label: 'Advanced'  })
        
    } // ---- End of preTabs ---- //

    /** Prep for edit
     * @param {*} node -
     */
    function onEditPrepare(node) {

        packageList(node.url)

        // Bug fix for messed up recording of template up to uib v3.3, fixed in v4
        if ( node.templateFolder === undefined || node.templateFolder === '' ) node.templateFolder = defaultTemplate

        // Set the checkbox initial states
        setInitialStates(node)

        prepTabs(node)

        // Set sourceFolder dropdown
        $(`#node-input-sourceFolder option[value="${node.sourceFolder || 'src'}"]`).prop('selected', true)
        $('#node-input-sourceFolder').val(node.sourceFolder || 'src')

        /** When the url changes (NB: Also see the validation function) change visible folder names & links
         * NB: Actual URL change processing is done in validation which also happens on change
         *     Change happens when config panel is opened as well as for a real change
         */
        $('#node-input-url').on('change', urlChange)

        // When the show web view (index) of source files changes
        $('#node-input-showfolder').on('change', function() {
            if ($(this).is(':checked') === false) $('#show-src-folder-idx-url').hide()
            else $('#show-src-folder-idx-url').show()
        })

        // Configure the template dropdown & setup button handlers
        templateSettings(node)

        // security settings
        securitySettings()

        //#region ---- File Editor ---- //

        // Mark edit save/reset buttons as disabled by default
        fileIsClean(true)

        // Handle the file editor change of folder/file (1st built on click of show edit button)
        $('#node-input-folder').change(function() { // (e) {
            // Rebuild the file list
            getFileList()
        })
        $('#node-input-filename').change(function() { // (e) {
            // Get the content of the file via the admin API
            getFileContents()
        })

        // Handle the folder new button
        $('#fldr-new-dialog_new').addClass('input-error')
            .prop('disabled',true)
        $('#fldr-input-newname').addClass('input-error')
            .on('input', function(){
                if ( /** @type {string} */ ($('#fldr-input-newname').val()).length === 0) {
                    $('#fldr-input-newname').addClass('input-error')
                    $('#fldr').addClass('input-error')
                        .prop('disabled',true)
                } else {
                    $('#fldr-input-newname').removeClass('input-error')
                    $('#fldr-new-dialog_new').removeClass('input-error')
                        .prop('disabled',false)
                }
            })
        // @ts-ignore
        $('#fldr-new-dialog').dialog({ // define the dialog box
            autoOpen:false, modal:true, closeOnEscape:true,
            buttons: [
                {
                    text: 'Create',
                    id: 'fldr-new-dialog_new',
                    click: function() {
                        // NB: Button is disabled unless name.length > 0 so don't need to check here
                        // Call the new file API
                        createNewFolder( /** @type {string} */ ($('#fldr-input-newname').val()) )
                        $('#fldr-input-newname').val(null)
                            .addClass('input-error')
                        $('#fldr-new-dialog_new').addClass('input-error')
                            .prop('disabled',true)
                        // @ts-ignore
                        $( this ).dialog( 'close' )
                    }
                },{
                    text: 'Cancel',
                    click: function() {
                        $('#fldr-input-newname').val(null)
                            .addClass('input-error')
                        $('#fldr-new-dialog_new').addClass('input-error')
                            .prop('disabled',true)
                        // @ts-ignore
                        $( this ).dialog( 'close' )
                    }
                },
            ]
        })
            .keyup(function(e) { // make enter key fire the create
                // @ts-ignore
                if (e.keyCode == $.ui.keyCode.ENTER) // eslint-disable-line eqeqeq
                    $('#fldr_new_dialog_new').trigger('click')
            })
        $('#btn-fldr-new').on('click', function() { // (e) {
            $('#fldr_url').html( /** @type {string} */ ($('#node-input-url').val()) )
            // @ts-ignore
            $('#fldr-new-dialog').dialog('open')  
        })
        // Handle the folder delete button
        // @ts-ignore
        $('#fldr-del-dialog').dialog({
            autoOpen:false, modal:true, closeOnEscape:true,
            buttons: [
                {
                    text: 'Delete',
                    id: 'fldr-del-dialog_del',
                    click: function() {
                        // Call the delete folder API (uses the current folder)
                        deleteFolder()
                        // @ts-ignore
                        $( this ).dialog( 'close' )
                    }
                },{
                    text: 'Cancel',
                    click: function() {
                        // @ts-ignore
                        $( this ).dialog( 'close' )
                    }
                },
            ]
        })
        $('#btn-fldr-del').on('click', function() { // (e) {
            $('#fldr-del-dialog_del').addClass('input-error')
                .css('color','brown')
            $('#fldr-del-name').text( /** @type {string} */ ($('#node-input-folder').val()) )
            if ( $('#node-input-folder').val() === 'src' ) {
                if ( $('#node-input-copyIndex').is(':checked') ) {
                    $('#fldr-del-recopy').css('color','')
                        .text('Copy flag is set so the src folder will be recreated and the index.(html|js|css) files will be recopied from the master template.')
                } else {
                    $('#fldr-del-recopy').css('color','brown')
                        .text('Copy flag is NOT set so the src folder will NOT be recopied from the master template.')
                }    
            } else {
                $('#fldr-del-recopy').css('color','')
                    .text('')
            }
            // @ts-ignore
            $('#fldr-del-dialog').dialog('open')                  
        })

        // Handle the file editor reset button (reload the file)
        $('#edit-reset').on('click', function(e) {
            e.preventDefault() // don't trigger normal click event

            // Get the content of the file via the admin API
            getFileContents()
            $('#file-action-message').text('')
        })
        // Handle the file editor save button
        $('#edit-save').on('click', function(e) {
            e.preventDefault() // don't trigger normal click event

            var authTokens = RED.settings.get('auth-tokens')
            
            // Post the updated content of the file via the admin API
            // NOTE: Cannot use jQuery POST function as it sets headers node trigger a CORS error. Do it using native requests only.
            // Clients will be reloaded if the reload checkbox is set.
            var request = new XMLHttpRequest()
            var params = 'fname=' + $('#node-input-filename').val() + '&folder=' + $('#node-input-folder').val() + 
                '&url=' + $('#node-input-url').val() + 
                '&reload=' + $('#node-input-reload').val() + 
                '&data=' + encodeURIComponent(uiace.editorSession.getValue())
            request.open('POST', 'uibuilder/uibputfile', true)
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
        // @ts-ignore
        $('#edit_delete_dialog').dialog({
            autoOpen:false, modal:true, closeOnEscape:true,
            buttons: [
                {
                    text: 'Delete',
                    id: 'edit_del_dialog_del',
                    click: function() {
                        // Call the delete file API (uses the current file)
                        deleteFile()
                        // @ts-ignore
                        $( this ).dialog( 'close' )
                    }
                },{
                    text: 'Cancel',
                    click: function() {
                        // @ts-ignore
                        $( this ).dialog( 'close' )
                    }
                },
            ]
        })
        $('#edit-delete').on('click', function() { // (e) {
            $('#edit_del_dialog_del').addClass('input-error')
                .css('color','brown')
            $('#edit-delete-name').text($('#node-input-folder').val() + '/' + $('#node-input-filename').val())
            if ( $('#node-input-folder').val() === 'src' ) {
                if ( $('#node-input-copyIndex').is(':checked') ) {
                    $('#edit-delete-recopy').css('color','')
                        .text('Copy flag is set so index.(html|js|css) files will be recopied from master template.')
                } else {
                    $('#edit-delete-recopy').css('color','brown')
                        .text('Copy flag is NOT set so index.(html|js|css) files will NOT be recopied from master template.')
                }    
            } else {
                $('#edit-delete-recopy').css('color','')
                    .text('')
            }
            // @ts-ignore
            $('#edit_delete_dialog').dialog('open')  
        })
        //#endregion

        //#region Handle the New file button
        $('#edit_new_dialog_new').addClass('input-error')
            .prop('disabled',true)
        $('#edit-input-newname').addClass('input-error')
            .on('input', function(){
                if ( /** @type {string} */ ($('#edit-input-newname').val()).length === 0) {
                    $('#edit-input-newname').addClass('input-error')
                    $('#edit_new_dialog_new').addClass('input-error')
                        .prop('disabled',true)
                } else {
                    $('#edit-input-newname').removeClass('input-error')
                    $('#edit_new_dialog_new').removeClass('input-error')
                        .prop('disabled',false)
                }
            })
        // @ts-ignore
        $('#edit_new_dialog').dialog({
            autoOpen:false, modal:true, closeOnEscape:true,
            buttons: [
                {
                    text: 'Create',
                    id: 'edit_new_dialog_new',
                    click: function() {
                        // NB: Button is disabled unless name.length > 0 so don't need to check here
                        // Call the new file API
                        createNewFile(/** @type {string} */ ($('#edit-input-newname').val()) )
                        $('#edit-input-newname').val(null)
                            .addClass('input-error')
                        $('#edit_new_dialog_new').addClass('input-error')
                            .prop('disabled',true)
                        // @ts-ignore
                        $( this ).dialog( 'close' )
                    }
                },{
                    text: 'Cancel',
                    click: function() {
                        $('#edit-input-newname').val(null)
                            .addClass('input-error')
                        $('#edit_new_dialog_new').addClass('input-error')
                            .prop('disabled',true)
                        // @ts-ignore
                        $( this ).dialog( 'close' )
                    }
                },
            ]
        })
            .keyup(function(e) { // make enter key fire the create
                // @ts-ignore
                if (e.keyCode == $.ui.keyCode.ENTER) // eslint-disable-line eqeqeq
                    $('#edit_new_dialog_new').click()
            })
        $('#edit-new').on('click', function() { // (e) {
            $('#file_url').html( /** @type {string} */ ($('#node-input-url').val()) )
            $('#file_fldr').html( /** @type {string} */ ($('#node-input-folder').val()) )
            // @ts-ignore
            $('#edit_new_dialog').dialog('open')  
        })
        //#endregion

        // Handle the expander button (show full screen editor) - from core function node
        $('#node-function-expand-js').on('click', function(e) {
            e.preventDefault()

            // Creates another edit session with max width
            var value = uiace.editor.getValue()
            RED.editor.editText({
                mode: $('#node-input-format').val(), //mode: $("#node-input-format").val(),
                value: value,
                width: 'Infinity',
                cursor: uiace.editor.getCursorPosition(),
                complete: function(v,cursor) {
                    // v contains the returned text
                    uiace.editor.setValue(v, -1)
                    uiace.editor.gotoLine(cursor.row+1,cursor.column,false)
                    setTimeout(function() {
                        uiace.editor.focus()
                        // Check if anything changed
                        if ( v !== value ) {
                            fileIsClean(false)
                        }
                    },300)
                }
            })

            // Are we in fullscreen? Variable is updated when oneditresize calls setACEheight()
            // if (uiace.fullscreen === false) {
            //     // Select the editor components and make full-screen, triggers oneditresize()
            //     var viewer = $('#edit-props')[0]
            //     var rFS = viewer.requestFullscreen || viewer.mozRequestFullScreen || viewer.webkitRequestFullscreen || viewer.msRequestFullScreen
            //     if (rFS) rFS.call(viewer)
                
            //     // TODO: Add popup if no method is available
            // } else {
            //     // Already in fullscreen so lets exit, triggers oneditresize()
            //     document.exitFullscreen()
            // }

        })

        //#endregion ---- File Editor ---- //

    } // ---- End of oneditprepare ---- //

    //#endregion ------------------------------------------------- //

    /** Initialise default values for package list - must be done before everything to give the ajax call time to finish
     *  since the list is used to check if the template dependencies are installed.
     * NOTE: This is build dynamically each time the edit panel is opened
     *       we are not saving this since external changes would result in
     *       users having being prompted to deploy even when they've made
     *       no changes themselves to a node instance.
     */
    //packageList()

    // Register the node type, defaults and set up the edit fns 
    RED.nodes.registerType(moduleName, {
        //#region --- options --- //
        category: paletteCategory,
        color: paletteColor,
        defaults: {
            name: { value: '' },
            topic: { value: '' },
            url: { value: moduleName, required: true, validate: validateUrl },
            fwdInMessages: { value: false },   // Should we send input msg's direct to output as well as the front-end?
            allowScripts: { value: false },    // Should we allow msg's to send JavaScript to the front-end?
            allowStyles: { value: false },     // Should we allow msg's to send CSS styles to the front-end?
            copyIndex: { value: true },        // DEPRECATED Should the default template files be copied to the instance src folder?
            templateFolder: { value: defaultTemplate },  // Folder for selected template
            extTemplate: { value: '' }, // Only if templateFolder=external, degit name
            showfolder: { value: false },      // Should a web index view of all source files be made available?
            useSecurity: { value: false },
            allowUnauth: { value: false },
            allowAuthAnon: { value: false },
            sessionLength: { value: defaultSessionLength, validate: validateSessLen },   // 5d - Must have content if useSecurity=true
            tokenAutoExtend: { value: false }, // TODO add validation if useSecurity=true
            oldUrl: { value: undefined },      // If the url has been changed, this is the previous url
            reload: { value: false },          // If true, all connected clients will be reloaded if a file is changed on the edit screens
            sourceFolder: { value: 'src', required: true, }, // Which folder to use for front-end code? (src or dist)
            //jwtSecret: { value: defaultJwtSecret, validate: validateSecret },   // Must have content if useSecurity=true
        },
        credentials: {
            jwtSecret: { type:'password' },  // text or password
        },
        inputs: 1,
        inputLabels: 'Msg to send to front-end',
        outputs: 2,
        outputLabels: ['Data from front-end', 'Control Msgs from front-end'],
        icon: 'ui_template.png',
        paletteLabel: nodeLabel,
        label: function () { return this.url || this.name || nodeLabel },
        //#endregion --- options --- //

        /** Available methods: 
         * oneditprepare: (function) called when the edit dialog is being built.
         * oneditsave:   (function) called when the edit dialog is okayed.
         * oneditcancel: (function) called when the edit dialog is canceled.
         * oneditdelete: (function) called when the delete button in a configuration node’s edit dialog is pressed.
         * oneditresize: (function) called when the edit dialog is resized.
         * onpaletteadd: (function) called when the node type is added to the palette.
         * onpaletteremove: (function) called when the node type is removed from the palette.
         */

        /** Prepares the Editor panel */
        oneditprepare: function() { onEditPrepare(this) },

        /** Runs before save
         * @this {RED}
         */
        oneditsave: function() {
            // xfer the editor text back to the template var
            //$('#node-input-template').val(this.editor.getValue())
            // Get rid of the editor
            if ( uiace.editorLoaded === true ) {
                uiace.editor.destroy()
                delete uiace.editor
                uiace.editorLoaded = false
            }

            // Check for url rename - note that validation of new url is done in the validate function
            if ( $('#node-input-url').val() !== this.url ) {
                this.oldUrl = this.url
            } else if ( this.oldUrl !== undefined ) {
                this.oldUrl = undefined
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
        oneditresize: function() { // (size) {

            setACEheight()

        }, // ---- End of oneditcancel ---- //

        /** Show notification warning before allowing delete */
        oneditdelete: function() {
            const that = this
            let myNotify = RED.notify(`<b>DELETE</b>: <p>You are deleting a uibuilder instance with url <i>${this.url}</i>.<br>Would you like to also delete the folder?<br><b>WARNING</b>: This cannot be undone.</p>`, {
                modal: true,
                fixed: true,
                type: 'warning', // 'compact', 'success', 'warning', 'error'
                buttons: [
                    {
                        text: 'Yes',
                        click: function() { // (e) {
                            // Mark folder for Deletion (actually done by the js file in `node.on('close', ..)`, handed off to uiblib:processClose)
                            $.ajax({
                                type: 'PUT',
                                dataType: 'json',
                                url: './uibuilder/admin/' + that.url,
                                data: {
                                    'cmd': 'deleteondelete',
                                },
                            })
                                .fail(function(jqXHR, textStatus, errorThrown) {
                                    console.error( '[uibuilder:oneditdelete:PUT] Error ' + textStatus, errorThrown )
                                    RED.notify(`uibuilder: Request url folder delete - error.<br>Folder will not be deleted, please delete manually.<br>${errorThrown}`, {type:'error'})
                                })

                            myNotify.close()
                            RED.notify(`The folder <i>${that.url}</i> will be deleted when you redeploy.`, {type:'compact'})
                        }
                    },
                    {
                        text: 'NO',
                        class:'primary',
                        click: function() { // (e) {
                            myNotify.close()
                        }
                    }
                ]
        
            })
        }, // ---- End of oneditdelete ---- //

    }) // ---- End of registerType() ---- //

}())
