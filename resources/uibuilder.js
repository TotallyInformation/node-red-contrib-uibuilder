// @ts-nocheck
/* eslint-disable sonarjs/no-duplicate-string, es/no-object-values, strict */

// Now loading as a module so no need to further Isolate this code
//#region --------- module variables for the panel --------- //

// RED._debug({topic: 'RED.settings', payload:RED.settings})

// NOTE: window.uibuilder is added by editor-common.js - see `resources` folder
const uibuilder = window['uibuilder']
const log = uibuilder.log
/** Module name must match this nodes html file @constant {string} moduleName */
const moduleName  = 'uibuilder'

/** Track which urls have been used - required for error handling in url validation. Only use for URL tracking */
const editorInstances = uibuilder.editorUibInstances
/** Default template name */
const defaultTemplate = 'blank'
/** List of installed packages - rebuilt when editor is opened, updates by library mgr */
let packages = uibuilder.packages

/** placeholder for ACE editor vars - so that they survive close/reopen admin config ui
 * @typedef {object} uiace Options for the ACE/Monaco code editor
 * @property {string} format What format to use for the code editor (html)
 * @property {string} folder What folder was last used
 * @property {string} fname What filename was last edited
 * @property {boolean} fullscreen Is the editor in fullscreen mode?
 */
const uiace = {
    'format': 'html',
    'folder': 'src',
    'fname': 'index.html',
    'fullscreen': false
}
/** placeholder for instance folder list
 * @type {Array<string>} */
let folders = []

//#endregion ------------------------------------------------- //

//#region --------- module functions for the panel --------- //

//#region ==== Package Management Functions ==== //

/** Perform a call to the package update v3 API
 * @param {JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>} evt jQuery Click Event
 */
function doPkgUpd(evt) {
    const packageName = evt.data.pkgName
    const node = evt.data.node
    const displayVer = evt.target.nextElementSibling

    RED.notify('Installing npm package ' + packageName)

    // Call the npm installPackage v2 API (it updates the package list)
    $.ajax({
        url: 'uibuilder/uibnpmmanage',
        method: 'GET',
        dataType: 'json', // Expect JSON data
        data: { // converted to URL parameters
            cmd: 'update',
            package: packageName,
            url: node.url,
        },
        beforeSend: function(jqXHR) {
            const authTokens = RED.settings.get('auth-tokens')
            if (authTokens) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
            }
        },
        success: function(data) {
            const npmOutput = data.result[0]

            if (data.success === true) {
                packages = uibuilder.packages = data.result[1]

                console.log('[uibuilder:doPkgUpd:get] PACKAGE INSTALLED. ', packageName, node.url, '\n\n', npmOutput, '\n ', packages[packageName])
                RED.notify(`Successful update of npm package ${packageName}`, 'success')
                displayVer.innerHTML = data.result[1][packageName].installedVersion
                $(evt.target).remove() // removes the update button
            } else {
                console.log('[uibuilder:doPkgUpd:get] ERROR ON INSTALLATION OF PACKAGE ', packageName, node.url, '\n\n', npmOutput, '\n ')
                RED.notify(`FAILED update of npm package ${packageName}`, 'error')
            }

            // Hide the progress spinner
            $('i.spinner').hide()
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('[uibuilder:doPkgUpd:get] Error ' + textStatus, errorThrown)
            RED.notify(`FAILED update of npm package ${packageName}`, 'error')

            $('i.spinner').hide()

            return 'addPackageRow failed'
            // TODO otherwise highlight input
        }
    })

    $.ajax({
        type: 'PUT',
        dataType: 'json',
        url: './uibuilder/admin/' + evt.data.node.url,  // v3 api
        data: {
            'cmd': 'updatepackage',
            'pkgName': evt.data.pkgName,
        },
        beforeSend: function(jqXHR) {
            const authTokens = RED.settings.get('auth-tokens')
            if (authTokens) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
            }
        },
    })
        .done(function(data, _textStatus, jqXHR) {

        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error( '[uibuilder:doPkgUpd:PUT] Error ' + textStatus, errorThrown )
            RED.notify(`uibuilder: Package update for '${evt.data.pkgName}' failed.<br>${errorThrown}`, { type: 'error' })
        })

    // Assuming update worked, hide the button - And update version string
    $(`#upd_${evt.data.pkgName}`).hide()
        .next().text('XXX')
}

/** AddItem function for package list
 * @param {object} node A reference to the panel's `this` object
 * @param {JQuery<HTMLElement>} element the jQuery DOM element to which any row content should be added
 * @param {number} index the index of the row
 * @param {string|*} data data object for the row. {} if add button pressed, else data passed to addItem method
 */
function addPackageRow(node, element, index, data) {
    let hRow = ''; let pkgSpec = null

    if (Object.entries(data).length === 0) { // Add button was pressed so we have no packageName, create an input form instead

        hRow  = `
            <div>
                <label for="packageList-input-${index}" style="width:3em;">Name:</label>
                <input type="text" id="packageList-input-${index}" title="" style="width:80%" placeholder="Valid npm package name">
            </div>
            <div>
                <label for="packageList-tag-${index}" style="width:3em;">Tag:</label>
                <input type="text" id="packageList-tag-${index}" title="" style="width:80%" placeholder="npm: @tag/version, GH: #branch/tag">
            </div>
            <div>
                <label for="packageList-button-${index}" style="width:3em;"></label>
                <button id="packageList-button-${index}" style="width:5em;">Install</button>
            </div>
        `
    } else { // existing line
        /*
            npm install [<@scope>/]<name>
            npm install [<@scope>/]<name>@<tag>
            npm install [<@scope>/]<name>@<version>
            npm install [<@scope>/]<name>@<version range>
            npm install <alias>@npm:<name>
            npm install <git-host>:<git-user>/<repo-name>[#branch-tag-name]
            npm install <git repo url>
            npm install <tarball file>
            npm install <tarball url>
            npm install <folder>
            */
        pkgSpec = packages[data]

        // if wanted !== installed, show update
        let upd = ''
        if ( pkgSpec.outdated && pkgSpec.outdated.wanted && pkgSpec.installedVersion !== pkgSpec.outdated.wanted ) {
            upd = `<button id="upd_${data}" style="color:orange;background-color:black;" title="Click to update (or install again to get a non-standard version)">UPDATE: ${pkgSpec.outdated.wanted}</button>`
            $('#node-input-packageList').on('click', `#upd_${data}`, { pkgName: data, node: node }, doPkgUpd)
        }

        // addItem method was called with a packageName passed
        hRow = `
            <div id="packageList-row-${index}" class="packageList-row-data">
                <div style="display:flex;justify-content:space-between;">
                    <div>
                        <a href="${pkgSpec.homepage}" target="_blank" title="Click to open package homepage in a new tab">
                            <b>${data}</b> <span class="emoji">ℹ️</span>
                        </a>
                    </div>
                    <div style="margin-left:auto;text-align:right;">
                        ${upd}
                        <span title="npm version specification: ${pkgSpec.spec}">${pkgSpec.installedVersion}</span>
                    </div>
                </div>
                <div title="NB: This link is an estimate, check the package docs for the actual entry point" style="display:flex;justify-content:space-between;">
                    <div>Est.&nbsp;link:</div>
                    <div style="margin-left:auto;text-align:right;"><code style="white-space:inherit;text-decoration: underline;"><a href="${uibuilder.urlPrefix}${pkgSpec.url}" target="_blank">
                        ${pkgSpec.url}
                    </code></div>
                </div>
            </div>
        `
    }
    // Build the output row
    $(hRow).appendTo(element)

    // Add tooltips for the input fields
    if (Object.entries(data).length === 0) {
        // @ts-expect-error ts(2339)
        $(`#packageList-input-${index}`).tooltip({
            content: 'Enter one of:<ul><li>An npm package name (optionally with leading)</li><li>A GitHub user/repo</li><li>A filing system path to a local package</li></ul>Ensure that you select the correct "From" dropdown.'
        })
        // @ts-expect-error ts(2339)
        $(`#packageList-ver-${index}`).tooltip({
            content: 'Optional. Branch, Tag or Version to install (defaults to @latest)'
        })
    }

    // Create a button click listener for the install button for this row
    $('#packageList-button-' + index).on('click', function() {
        // show activity spinner
        $('i.spinner').show()

        // Get the data from the input fields
        const packageName = String($(`#packageList-input-${index}`).val())
        const packageTag = String($(`#packageList-tag-${index}`).val())

        if ( packageName.length !== 0 ) {
            RED.notify('Installing npm package ' + packageName)

            // Call the npm installPackage v2 API (it updates the package list)
            $.ajax({
                url: 'uibuilder/uibnpmmanage',
                method: 'GET',
                dataType: 'json', // Expect JSON data
                data: { // converted to URL parameters
                    cmd: 'install',
                    package: packageName,
                    url: node.url,
                    tag: packageTag,
                },
                beforeSend: function(jqXHR) {
                    const authTokens = RED.settings.get('auth-tokens')
                    if (authTokens) {
                        jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
                    }
                },
                success: function(data) {
                    const npmOutput = data.result[0]

                    if ( data.success === true) {
                        packages = uibuilder.packages = data.result[1]

                        console.log('[uibuilder:addPackageRow:get] PACKAGE INSTALLED. ', packageName, node.url, '\n\n', npmOutput, '\n ', packages[packageName])
                        RED.notify(`Successful installation of npm package ${packageName} for ${node.url}`, 'success')
                        RED._debug({ topic: 'UIBUILDER Library Install', result: 'success', payload: packageName, output: npmOutput })

                        // reset and populate the list
                        $('#node-input-packageList').editableList('empty')
                        // @ts-ignore
                        $('#node-input-packageList').editableList('addItems', Object.keys(packages))

                    } else {
                        console.log('[uibuilder:addPackageRow:get] ERROR ON INSTALLATION OF PACKAGE ', packageName, node.url, '\n\n', npmOutput, '\n ' )
                        RED.notify(`FAILED installation of npm package ${packageName} for ${node.url}`, 'error')
                    }

                    // Hide the progress spinner
                    $('i.spinner').hide()
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('[uibuilder:addPackageRow:get] ERROR ON INSTALLATION OF PACKAGE ', packageName, node.url, '\n\n', textStatus, '\n ', errorThrown, '\n ' )
                    RED.notify(`FAILED installation of npm package ${packageName} for ${node.url}`, 'error')
                }
            })
                .fail(function(_jqXHR, textStatus, errorThrown) {
                    console.error( '[uibuilder:addPackageRow:get] Error ' + textStatus, errorThrown )
                    RED.notify(`FAILED installation of npm package ${packageName} for ${node.url}`, 'error')

                    $('i.spinner').hide()
                    return 'addPackageRow failed'
                    // TODO otherwise highlight input
                })
        } // else Do nothing
    }) // -- end of button click -- //
} // --- End of addPackageRow() ---- //

/** RemoveItem function for package list
 * @param {string} packageName Name of the npm package to remove
 * @returns {string|null} Result text
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
    $.ajax({
        url: 'uibuilder/uibnpmmanage',
        method: 'GET',
        dataType: 'json', // Expect JSON data
        data: { // converted to URL parameters
            cmd: 'remove',
            package: packageName,
        },
        beforeSend: function(jqXHR) {
            const authTokens = RED.settings.get('auth-tokens')
            if (authTokens) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
            }
        },
        success: function(data) {

            if ( data.success === true) {
                console.log('[uibuilder:removePackageRow:get] PACKAGE REMOVED. ', packageName)
                RED.notify('Successfully uninstalled npm package ' + packageName, 'success')
                if ( packages[packageName] ) delete packages[packageName]
            } else {
                console.log('[uibuilder:removePackageRow:get] ERROR ON PACKAGE REMOVAL ', data.result )
                RED.notify(`FAILED to uninstall npm package ${packageName}`, 'error')
                // Put the entry back again
                $('#node-input-packageList').editableList('addItem', packageName)
            }

            $('i.spinner').hide()
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('[uibuilder:removePackageRow:get] ERROR ON PACKAGE REMOVAL ', packageName, '\n\n', textStatus, '\n ', errorThrown, '\n ' )
            RED.notify(`FAILED to uninstall npm package ${packageName}`, 'error')
        }
    })
        .fail(function(_jqXHR, textStatus, errorThrown) {
            console.error( '[uibuilder:removePackageRow:get] Error ' + textStatus, errorThrown )
            RED.notify('FAILED to uninstall npm package ' + packageName, 'error')

            // Put the entry back again
            // @ts-ignore
            $('#node-input-packageList').editableList('addItem', packageName)

            $('i.spinner').hide()
            return 'removePackageRow failed'
            // TODO otherwise highlight input
        })

    return null
} // ---- End of removePackageRow ---- //

//#endregion ==== Package Management Functions ==== //

//#region ==== File Management Functions ==== //

/** Return a file type from a file name (or default to txt)
 *  ftype can be used in ACE editor modes
 * @param {string} fname File name for which to return the type
 * @returns {string} File type
 */
function fileType(fname) {
    let ftype = 'text'
    const fparts = fname.split('.')
    // Take off the first entry if the file name started with a dot
    if ( fparts[0] === '' ) fparts.shift()
    if (fparts.length > 1) {
        // Get the last element of the array
        // eslint-disable-next-line newline-per-chained-call
        const fext = fparts.pop().toLowerCase().trim()
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
    // $('#edit-delete').prop('disabled', !isClean)
    $('#edit-close').prop('disabled', !isClean)
    $('#node-edit-file').prop('disabled', !isClean)
    $('#node-input-filename').prop('disabled', !isClean)
    // If not clean, disable main Done and Cancel buttons to prevent loss
    $('#node-dialog-ok').prop('disabled', !isClean)
    $('#node-dialog-cancel').prop('disabled', !isClean)
    // If not clean, Add a user hint
    if ( !isClean ) {
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
    const url = $('#node-input-url').val()

    /** Get the chosen folder name - use the default/last saved on first load
     * @type {string} */
    // @ts-ignore
    let folder = $('#node-input-folder').val()
    if ( folder === null ) {
        folder = localStorage.getItem('uibuilder.' + url + '.folder') || uiace.folder
    }
    /** Get the chosen filename - use the default/last saved on first load
     * @type {string} */
    // @ts-ignore
    let fname = $('#node-input-filename').val()
    if ( fname === null ) {
        fname = localStorage.getItem('uibuilder.' + url + '.selectedFile') || uiace.fname
    }

    // Save the file & folder names
    uiace.folder = folder
    uiace.fname = fname

    // Persist the folder & file name selection
    localStorage.setItem('uibuilder.' + url + '.folder', uiace.folder)
    localStorage.setItem('uibuilder.' + url + '.selectedFile', uiace.fname)

    // Change mode to match file type
    const filetype = uiace.format = fileType(fname)
    $('#node-input-format').val(filetype)

    // Get the file contents via API defined in uibuilder.js
    $.ajax({
        url: 'uibuilder/uibgetfile',
        method: 'GET',
        data: { // converted to URL parameters
            'url': url,
            'fname': fname,
            'folder': folder,
        },
        beforeSend: function(jqXHR) {
            const authTokens = RED.settings.get('auth-tokens')
            if (authTokens) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
            }
        },
        success: function(data) {
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
        },
    })
        .fail(function(_jqXHR, textStatus, errorThrown) {
            console.error( '[uibuilder:getFileContents:get] Error ' + textStatus, errorThrown )
            uiace.editorSession.setValue('')
            $('#node-input-template-editor').hide()
            $('#node-input-template-editor-no-file').show()
        })
        .always(function() {
            fileIsClean(true)
            // Default the language selector in case it wasn't recognised
            if (!$('#node-input-format option:selected').length) $('#node-input-format').val('text')
        })
} // --- End of getFileContents --- //

/** Get the list of files for the chosen url & folder
 * @param {string} [selectedFile] Optional. If present will select this filename after refresh, otherwise 1st file is selected.
 */
function getFileList(selectedFile) {
    //#region --- Collect variables from Config UI ---
    const url = /** @type {string} */ ($('#node-input-url').val())
    let folder = /** @type {string} */ ($('#node-input-folder').val())
    const f = /** @type {string} */ ($('#node-input-filename').val())

    // Whether or not to force the index.(html|js|css) files to be copied over if missing
    // var nodeInputCopyIndex = $('#node-input-copyIndex').is(':checked')
    //#endregion -------------------------------------

    // Collect the current filename from various places
    if ( selectedFile === undefined ) selectedFile = /** @type {string} */ (f)
    if ( selectedFile === null ) {
        selectedFile = localStorage.getItem('uibuilder.' + url + '.selectedFile') || undefined
    }

    if ( folder === null ) {
        folder = localStorage.getItem('uibuilder.' + url + '.folder') || undefined
    }

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
        beforeSend: function(jqXHR) {
            const authTokens = RED.settings.get('auth-tokens')
            if (authTokens) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
            }
        },
    })
        // eslint-disable-next-line no-unused-vars
        .done(function(data, _textStatus, jqXHR) {
            let firstFile = ''; let indexHtml = false; let selected = false

            // build folder list, pre-select src if no current folder selected #node-input-folder - Object.keys(res)
            const folders = Object.keys(data).sort()

            // Rebuild folder drop-down
            $.each(folders, function (i, fldrname) {
                // For the root folder, use empty string for folders lookup but "root" for display
                if ( fldrname === '' ) fldrname = 'root'
                // Build the drop-down
                $('#node-input-folder').append($('<option>', {
                    value: fldrname,
                    text: fldrname,
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
            localStorage.setItem('uibuilder.' + url + '.folder', folder)

            let files = []
            files = data[folder]

            $.each(files, function (i, filename) {
                // Build the drop-down
                $('#node-input-filename').append($('<option>', {
                    value: filename,
                    text: filename,
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
            localStorage.setItem('uibuilder.' + url + '.selectedFile', uiace.fname)

        })
        .fail(function(jqXHR, textStatus, errorThrown) {

            console.error( '[uibuilder:getFileList:getJSON] Error ' + textStatus, errorThrown )
            uiace.fname = ''
            uiace.format = 'text'
            RED.notify(`uibuilder: Folder and file listing error.<br>${errorThrown}`, { type: 'error' })

        })
        .always(function() {
            getFileContents()
        })

} // --- End of getFileList --- //

/** Get a full list of instance folders (minus protected ones). Updates folders global var. */
function getFolders() {
    const url = /** @type {string} */ ($('#node-input-url').val())

    const data = $.ajax({
        async: false,
        type: 'GET',
        dataType: 'json',
        url: './uibuilder/admin/' + url,
        data: {
            'cmd': 'listfolders',
        },
        beforeSend: function(jqXHR) {
            const authTokens = RED.settings.get('auth-tokens')
            if (authTokens) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
            }
        },
    })

    folders = data.responseJSON

    $('#node-input-sourceFolder').typedInput({
        types: [
            {
                value: 'sourceFolders',
                options: folders,
            }
        ]
    })
} // --- End of getFolders --- //

/** Call v3 admin API to create a new folder
 * @param {string} folder Name of new folder to create (combines with current uibuilder url)
 * returns {string} Status message
 */
function createNewFolder(folder) {
    // Also get the current url
    const url = $('#node-input-url').val()

    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: `./uibuilder/admin/${url}`,
        data: {
            'folder': folder,
            'cmd': 'newfolder',
        },
        beforeSend: function(jqXHR) {
            const authTokens = RED.settings.get('auth-tokens')
            if (authTokens) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
            }
        },
    })
        .done(function() { // data, textStatus, jqXHR) {
            RED.notify(`uibuilder: Folder <code>${folder}</code> Created.`, { type: 'success' })
            // Rebuild the file list
            getFileList()
            // Rebuild the folder list
            getFolders()

            return 'Create folder succeeded'
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            RED.notify(`uibuilder: Create Folder Error.<br>${errorThrown}`, { type: 'error' })
            return 'Create folder failed'
        })
} // --- End of createNewFile --- //

/** Call v3 admin API to create a new file
 * @param {string} fname Name of new file to create (combines with current selected folder and the current uibuilder url)
 * returns {string} Status message
 */
function createNewFile(fname) {
    // Also get the current folder & url
    const folder = $('#node-input-folder').val() || uiace.folder
    const url = $('#node-input-url').val()

    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: `./uibuilder/admin/${url}`,
        data: {
            'folder': folder,
            'fname': fname,
            'cmd': 'newfile',
        },
        beforeSend: function(jqXHR) {
            const authTokens = RED.settings.get('auth-tokens')
            if (authTokens) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
            }
        },
    })
        .done(function() { // data, textStatus, jqXHR) {
            RED.notify(`uibuilder: File <code>${folder}/${fname}</code> Created.`, { type: 'success' })
            // Rebuild the file list
            getFileList(fname)

            return 'Create file succeeded'
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error( '[uibuilder:createNewFile:post] Error ' + textStatus, errorThrown )
            RED.notify(`uibuilder: Create File Error.<br>${errorThrown}`, { type: 'error' })
            return 'Create file failed'
        })
} // --- End of createNewFile --- //

/** Call v3 admin API to delete the currently selected folder
 * returns {string} Status message
 */
function deleteFolder() {
    // Also get the current url & folder
    const url = $('#node-input-url').val()
    const folder = $('#node-input-folder').val()

    $.ajax({
        type: 'DELETE',
        dataType: 'json',
        url: `./uibuilder/admin/${url}`,
        data: {
            'folder': folder,
            'cmd': 'deletefolder',
        },
        beforeSend: function(jqXHR) {
            const authTokens = RED.settings.get('auth-tokens')
            if (authTokens) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
            }
        },
    })
        .done(function() { // data, textStatus, jqXHR) {
            RED.notify(`uibuilder: Folder <code>${folder}</code> deleted.`, { type: 'success' })
            // Rebuild the file list
            getFileList()

            return 'Delete folder succeeded'
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error( '[uibuilder:deleteFolder:delete] Error ' + textStatus, errorThrown )
            RED.notify(`uibuilder: Delete Folder Error.<br>${errorThrown}`, { type: 'error' })
            return 'Delete folder failed'
        })

} // --- End of deleteFolder --- //

/** Call v3 admin API to delete the currently selected file
 * returns {string} Status message
 */
function deleteFile() {
    // Get the current file, folder & url
    const folder = /** @type {string} */ ($('#node-input-folder').val()) || uiace.folder
    const url = /** @type {string} */ ($('#node-input-url').val())
    const fname = /** @type {string} */ ($('#node-input-filename').val())

    $.ajax({
        type: 'DELETE',
        dataType: 'json',
        url: `./uibuilder/admin/${url}`,
        data: {
            'folder': folder,
            'fname': fname,
            'cmd': 'deletefile',
        },
        beforeSend: function(jqXHR) {
            const authTokens = RED.settings.get('auth-tokens')
            if (authTokens) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
            }
        },
    })
        .done(function() { // data, textStatus, jqXHR) {
            RED.notify(`uibuilder: File <code>${folder}/${fname}</code> Deleted.`, { type: 'success' })
            // Rebuild the file list
            getFileList(fname)

            return 'Delete file succeeded'
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error( '[uibuilder:deleteFile:delete] Error ' + textStatus, errorThrown )
            RED.notify(`uibuilder: Delete File Error.<br>${errorThrown}`, { type: 'error' })
            return 'Delete file failed'
        })

} // --- End of deleteFile --- //

/** Set the height of the ACE text editor box */
function setACEheight() {
    let height

    if ( uiace.editorLoaded === true ) {
        // If the editor is in full-screen ...
        if (document.fullscreenElement) {
            // Force background color and add some padding to keep away from edge
            $('#edit-props').css('background-color', '#f6f6f6')
                .css('padding', '1em')

            // Start to calculate the available height and adjust the editor to fill the ht
            height = parseInt($('#edit-props').css('height'), 10) // full available height
            height -= 25

            // Replace the expand icon with a compress icon
            $('#node-function-expand-js').css('background-color', 'black')
                .html('<i class="fa fa-compress"></i>')

            uiace.fullscreen = true
        } else {
            // Don't bother if the top of the editor is still auto
            if ( $('#edit-outer').css('top') === 'auto' ) return

            $('#edit-props').css('background-color', '')
                .css('padding', '')

            height = ($('.red-ui-tray-footer').position()).top - ($('#edit-outer').offset()).top - 35

            // Replace the compress icon with a expand icon
            $('#node-function-expand-js').css('background-color', '')
                .html('<i class="fa fa-expand"></i>')

            uiace.fullscreen = false
        }

        // everything but the edit box
        const rows = $('#edit-props > div:not(.node-text-editor-row)')

        // subtract height of each row from the total
        for (let i = 0; i < rows.length; i++) {
            height -= $(rows[i]).outerHeight(true) // eslint-disable-line no-unused-vars
        }

        // Set the height of the edit box - no longer needed, using calc CSS
        // $('#node-input-template-editor').css('height', height + 'px')

        // Get the content to match the edit box size
        uiace.editor.resize()
    }
} // --- End of setACEheight --- //

/** Save Edited File */
function saveFile() {
    const authTokens = RED.settings.get('auth-tokens')

    // Post the updated content of the file via the admin API
    // NOTE: Cannot use jQuery POST function as it sets headers node trigger a CORS error. Do it using native requests only.
    // Clients will be reloaded if the reload checkbox is set.
    const request = new XMLHttpRequest()
    const params = 'fname=' + $('#node-input-filename').val() + '&folder=' + $('#node-input-folder').val() +
        '&url=' + $('#node-input-url').val() +
        '&reload=' + $('#node-input-reload').prop('checked') +
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
} // ---- End of saveFile ---- //

/** Create the wrapping HTML string that provides a link to open the instance folder in vscode
 * @param {object} node A reference to the panel's `this` object
 * @returns {{pre,post,url,icon}} Prefix and postfix for link + vscode url scheme & icon
 */
function vscodeLink(node) {
    if (node.url) {
        if (uibuilder.localHost) node.editurl = `vscode://file${RED.settings.uibuilderRootFolder}/${node.url}/?windowId=_blank`
        else node.editurl = `vscode://vscode-remote/ssh-remote+${uibuilder.nrServer}${RED.settings.uibuilderRootFolder}/${node.url}/?windowId=_blank`
        $('#node-input-editurl').val(node.editurl)
    }

    let pre, post
    if (node.editurl) {
        pre = `<a href="${node.editurl}" title="Open in VScode">`
        post = '</a>'
    } else {
        pre = '<b>'
        post = '</b>'
    }
    return {
        pre: pre,
        post: post,
        url: node.editurl,
        icon: '<img src="resources/node-red-contrib-uibuilder/vscode.svg" style="width:20px" >',
    }
}

//#endregion ==== File Management Functions ==== //

//#region ==== Validation Functions ==== //
// These are called on editor load & node added to flow as well as on form change
// Use `$('#node-input-url').length > 0` to check if form exists

/** Update the deployed instances list
 * @param {object} node Pass in this
 */
function updateDeployedInstances(node) {
    uibuilder.deployedUibInstances =  uibuilder.getDeployedUrls()
    if ( node ) node.isDeployed = uibuilder.deployedUibInstances[node.id] !== undefined
}

/** Find out if a server folder exists for this url
 * @param {string} url URL to check
 * @returns {boolean} Whether the folder exists
 */
function queryFolderExists(url) {
    if (url === undefined) return false
    let check = false
    $.ajax({
        type: 'GET',
        async: false,
        dataType: 'json',
        url: `./uibuilder/admin/${url}`,
        data: {
            'cmd': 'checkfolder',
        },
        beforeSend: function(jqXHR) {
            const authTokens = RED.settings.get('auth-tokens')
            if (authTokens) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
            }
        },
        success: function(data) {
            check = data
        },
        error: function(jqXHR, textStatus, errorThrown) {
            if (errorThrown !== 'Not Found') {
                console.error( '[uibuilder:queryFolderExists] Error ' + textStatus, errorThrown )
            }
            check = false
        },
    })
    return check
} // ---- end of queryFolderExists ---- //

/** (Dis)Allow uibuilder configuration other than URL changes
 * @param {object} urlErrors List of errors
 * @param {boolean} enable True=Enable config editing, false=disable
 */
function enableEdit(urlErrors, enable = true) {
    if (enable === true) {
        // Enable template changes
        $('#node-input-templateFolder, #btn-load-template')
            .prop('disabled', false)
            .css({
                'cursor': 'pointer',
            })

        // Enable tabs and links
        $('#red-ui-tab-tab-files, #red-ui-tab-tab-libraries, #red-ui-tab-tab-security, #red-ui-tab-tab-advanced, info')
            .css({
                'cursor': 'pointer',
            })
        $('#red-ui-tab-tab-files>a, #red-ui-tab-tab-libraries>a, #red-ui-tab-tab-security>a, #red-ui-tab-tab-advanced>a, info>a')
            .prop('disabled', false)
            .css({
                'pointer-events': 'auto',
                'cursor': 'pointer',
                'opacity': 1,
            })

        // Enable action buttons
        $('#uibuilderurl, #uibinstanceconf, #uib-apps-list')
            .prop('disabled', false)
            .css({
                // 'pointer-events': 'auto',
                'cursor': 'pointer',
                'opacity': 1,
            })

        // Clear the errors
        $('#url-errors').remove()
    } else {
        // Disable template changes
        $('#node-input-templateFolder, #btn-load-template')
            .prop('disabled', true)
            .css({
                'cursor': 'not-allowed',
            })

        // Disable tabs and links
        $('#red-ui-tab-tab-files, #red-ui-tab-tab-libraries, #red-ui-tab-tab-security, #red-ui-tab-tab-advanced, info')
            .css({
                'cursor': 'not-allowed',
            })
        $('#red-ui-tab-tab-files>a, #red-ui-tab-tab-libraries>a, #red-ui-tab-tab-security>a, #red-ui-tab-tab-advanced>a, info>a')
            .prop('disabled', true)
            .css({
                'pointer-events': 'none',
                'cursor': 'not-allowed',
                'opacity': 0.3,
            })

        // Disable action buttons
        $('#uibuilderurl, #uibinstanceconf, #btntopopen, #uib-apps-list')
            .prop('disabled', true)
            .css({
                // 'pointer-events': 'none',
                'cursor': 'not-allowed',
                'opacity': 0.3,
            })

        // Show the errors
        $('#url-errors').remove()
        $('#url-input').after(`
            <div id="url-errors" class="form-row" style="color:var(--red-ui-text-color-error)">
                ${Object.values(urlErrors).join('<br>')} 
            </div>
        `)
    }
} // ---- End of enableEdit ---- //

/** Show key data for URL changes
 * @param {*} node Reference to node definition
 * @param {*} value Value
 */
function debugUrl(node, value) { // eslint-disable-line no-unused-vars
    if (!uibuilder.debug) return

    console.groupCollapsed(`>> validateUrl >> ${node.id}`)
    log('-- isDeployed --', node.isDeployed )
    log('-- node.url --', node.url, '-- node.oldUrl --', node.oldUrl)
    log('-- value --', value)
    log('-- Editor URL Changed? --', node.urlChanged, '-- Valid? --', node.urlValid )
    log('-- Deployed URL Changed? --', node.urlDeployedChanged )
    log('-- deployedUibInstances[node.id] --', uibuilder.deployedUibInstances[node.id])
    log('-- editorInstances[node.id] --', editorInstances[node.id])
    log('-- is Dup? -- Deployed:', node.urlDeployedDup, ', Editor:', node.urlEditorDup)
    log('-- URL Errors --', node.urlErrors )
    log('-- Node Changed? --', node.changed, '-- Valid? --', node.valid )
    log('-- this --', node)
    console.groupEnd()
}
/** Live URL Validation Function: Validate the url property
 * Max 20 chars, can't contain any of ['..', ]
 * @param {string} value The url value to validate
 * @returns {boolean} true = valid
 * @this {*}
 **/
function validateUrl(value) {
    if ($('#node-input-url').is(':visible')) {
        // Update the DEPLOYED instances list (also updates this.isDeployed) - not needed on Editor load
        updateDeployedInstances(this)
        // console.log(this.url, '#node-input-url IS VISIBLE. ', 'Changed? ', this.changed)
    }

    // this.urlValid = false
    this.urlErrors = {}

    this.urlDeployedChanged = uibuilder.deployedUibInstances[this.id] !== value //  || (this.oldUrl !== undefined && this.url !== this.oldUrl)
    this.urlChanged = (this.url !== value)

    let f = Object.values(uibuilder.deployedUibInstances).indexOf(value)
    this.urlDeployedDup = ( f > -1 && Object.keys(uibuilder.deployedUibInstances)[f] !== this.id )
    f = Object.values(editorInstances).indexOf(value)
    this.urlEditorDup = ( f > -1 && Object.keys(editorInstances)[f] !== this.id )

    // If value is undefined, node hasn't been configured yet - we assume empty url which is invalid
    if ( value === undefined ) {
        this.urlErrors.config = 'Not yet configured, valid URL needed'
    }

    // Must be >0 chars
    if ( value === undefined || value === '' ) {
        this.urlErrors.none = 'Must not be empty' }
    else { // These will fail for empty value
        // Max 20 chars
        if ( value.length > 20 ) {
            this.urlErrors.len = 'Too long, must be <= 20 chars'
        }
        // Cannot contain ..
        if ( value.indexOf('..') !== -1 ) {
            this.urlErrors.dbldot = 'Cannot contain <code>..</code> (double-dot)'
        }
        // Cannot contain / or \
        if ( value.indexOf('/') !== -1 ) {
            this.urlErrors.fslash = 'Cannot contain <code>/</code>'
        }
        if ( value.indexOf('\\') !== -1 ) {
            this.urlErrors.bslash = 'Cannot contain <code>\\</code>'
        }
        // Cannot contain spaces
        if ( value.indexOf(' ') !== -1 ) {
            this.urlErrors.sp = 'Cannot contain spaces' }
        // Cannot start with _ or .
        if ( value.substring(0, 1) === '_' ) {
            this.urlErrors.strtU = 'Cannot start with <code>_</code> (underscore)' }
        if ( value.substring(0, 1) === '.' ) {
            this.urlErrors.strtDot = 'Cannot start with <code>.</code> (dot)' }
        // Cannot be 'templates' as this is a reserved value (for v2)
        if ( value.toLowerCase().substring(0, 9) === 'templates' ) {
            this.urlErrors.templ = 'Cannot be "templates"' }
        // Cannot be 'common' as this is a reserved value
        if ( value.toLowerCase().substring(0, 9) === 'common' ) {
            this.urlErrors.templ = 'Cannot be "common"' }
        // Must not be `uibuilder` (breaking change in v5)
        if ( value.toLowerCase() === 'uibuilder' ) {
            this.urlErrors.uibname = 'Cannot be "uibuilder" (since v5)' }
    }

    // TODO ?MAYBE? Notify's shouldn't be here - only needed if "Done" (or event change)

    // Check whether the url is already in use in another deployed uib node
    if ( this.urlDeployedDup === true ) {
        // RED.notify(`<b>ERROR</b>: <p>The chosen URL (${value}) is already in use.<br>It must be changed before you can save/commit</p>`, {type: 'error'})
        this.urlErrors.dup = 'Cannot be a URL already deployed'
    }

    // Check whether the url is already in use in another undeployed uib node
    if ( this.urlEditorDup === true ) {
        // RED.notify(`<b>ERROR</b>: <p>The chosen URL (${value}) is already in use in another undeployed uib node.<br>It must be changed before you can save/commit</p>`, {type: 'error'})
        this.urlErrors.dup = 'Cannot be a URL already in use'
    }

    // Check whether the folder already exists - if it does, give a warning & adopt it
    if ( value !== undefined && value !== '') {
        this.folderExists = queryFolderExists(value)

        /** If the folder already exists but not in another node */
        if ( this.urlEditorDup === false && this.folderExists === true && this.urlChanged === true ) {
            log('>> folder already exists >>', this.url, this.id)
            RED.notify(`<b>WARNING</b>: <p>The folder for the chosen URL (${value}) is already exists.<br>It will be adopted by this node.</p>`, { type: 'warning' })
        }

        if ( this.folderExists === false ) {
            this.urlErrors.fldNotExist = 'URL does not yet exist. You must Deploy first.<br>If changing a deployed URL, the folder will be renamed on Deploy'
        }
    }

    // Warn user when changing URL. NOTE: Set/reset old url in the onsave function not here
    if ( this.isDeployed && this.deployedUrlChanged === true ) {
        log('[uib] >> deployed url changed >> this.url:', this.url, ', this.oldUrl:', this.oldUrl, this.id)
        this.urlErrors.warnChange = `Renaming from ${this.url} to ${value}. <b>MUST</b> redeploy now`
        RED.notify(`<b>NOTE</b>: <p>You are renaming the url from ${this.url} to ${value}.<br>You <b>MUST</b> redeploy before doing anything else.</p>`, { type: 'warning' })
    }

    // Process panel display for valid/invalid URL - NB repeated once in oneditprepare cause 1st time this is called, the panel doesn't yet exist
    if ( Object.keys(this.urlErrors).length > 0) {
        // Changed URL not valid: turn off other edits, show errors
        this.urlValid = false
        enableEdit(this.urlErrors, false)
        this.okToGo = false
    } else {
        // Changed URL valid: turn on other edits
        this.urlValid = true
        enableEdit(this.urlErrors, true)
        this.okToGo = true
    }

    // debugUrl(this, value)

    // Add exception if the only error is that the fldr doesn't yet exist
    if ( Object.keys(this.urlErrors).length === 1 &&  this.urlErrors.fldNotExist ) {
        this.okToGo = true
        return true
    }

    return this.urlValid
} // --- End of validateUrl --- //

/** Validation Function: Validate the session length property
 * If security is on, must contain a number
 * @returns {boolean} true = valid, false = not valid
 * @this {*}
 **/
// function validateSessLen() {
//     // NB: `this` is the node instance configuration as at last press of Done
//     // TODO: Add display comment to help user

//     var newVal = $('#node-input-sessionLength').val()
//     var newSec = $('#node-input-useSecurity').is(':checked')

//     if (newSec === true && (newVal.toString()).length < 1 ) return false

//     return true

// } // --- End of validateSessLen --- //

/** Validation Function: Validate the jwtSecret property
 * If security is on, must contain text
 * @returns {boolean} true = valid, false = not valid
 **/
// function validateSecret() { // eslint-disable-line no-unused-vars
//     // NB: `this` is the node instance configuration as at last press of Done
//     // TODO: Add display comment to help user

//     var newVal = $('#node-input-jwtSecret').val()
//     var newSec = $('#node-input-useSecurity').is(':checked')

//     if (newSec === true && (newVal.toString()).length < 1 ) return false

//     return true

// } // --- End of validateSecret --- //

/** Validation function: Was this node last deployed with a safe version?
 * In uibuilder.js, can change uib.reDeployNeeded to be the last version before the v that made a breaking change.
 * @example If the node was last deployed with v4.1.2 and the current version is now v5.0.0, set uib.reDeployNeeded to '4.1.2'
 * @returns {boolean} True if valid
 * @this {*}
 */
function validateVersion() {
    if ( this.url !== undefined ) { // Undefined means that the node hasn't been configured at all yet
        const deployedVersion = this.deployedVersion === undefined ? '0' : this.deployedVersion
        if (deployedVersion < RED.settings.uibuilderRedeployNeeded && RED.settings.uibuilderCurrentVersion > RED.settings.uibuilderRedeployNeeded) {
            RED.notify(`<i>uibuilder ${this.url}</i><br>uibuilder has been updated since you last deployed this instance. Please deploy now.`, {
                modal: false,
                fixed: false,
                type: 'warning', // 'compact', 'success', 'warning', 'error'
            })
            this.mustChange = true
            return false
        }
    }
    return true
}

//#endregion ==== Validation Functions ==== //

//#region ==== Template Management Functions ==== //

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
            text: templ.name,
        }))
    })

    // Just in case name doesn't exist in template list, default to blank
    if ( !uibuilderTemplates[templateFolder] ) {
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

    if ( !RED.settings.uibuilderTemplates[folder] ) {
        console.error(`[uibuilder:checkDependencies] Template name not found: ${folder}`)
        return
    }

    const deps = RED.settings.uibuilderTemplates[folder].dependencies || []
    const missing = []

    deps.forEach( depName => {
        if ( !packages[depName] ) missing.push(depName)
    })

    if ( missing.length > 0 ) {
        const myNotification = RED.notify(`WARNING<br /><br />The selected uibuilder template (${folder}) is MISSING the following dependencies:<div> ${missing.join(', ')}</div><br />Please install them using the uibuilder Library Manager or select a different template.`, {
            type: 'warning',
            modal: true,
            fixed: true,
            buttons: [
                {
                    text: 'OK',
                    class: 'primary',
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
    const template = $('#node-input-templateFolder').val()
    const extTemplate = $('#node-input-extTemplate').val()
    const url = $('#node-input-url').val()
    const reload = $('#node-input-reload').prop('checked')

    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: `./uibuilder/admin/${url}`,
        data: {
            'template': template,
            'extTemplate': extTemplate,
            'cmd': 'replaceTemplate',
            'reload': reload,
            'url': url,
        },
        beforeSend: function(jqXHR) {
            const authTokens = RED.settings.get('auth-tokens')
            if (authTokens) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
            }
        },
    })
        .done(function(data, textStatus, jqXHR) {
            RED.notify(`<b>uibuilder</b>:<br><br>${jqXHR.statusText}<br>`, { type: 'success' })
            return 'Template load succeeded'
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error( '[uibuilder:loadTemplate] Error ' + textStatus, errorThrown )
            RED.notify(`<b>uibuilder</b>:<br><br>Template Load Error.<br><br>${errorThrown}<br>`, { type: 'error' })
            return 'Template load failed'
        })
} // --- End of loadTemplate() --- //

/** Load a new template */
function btnTemplate() {
    // Check first
    const myNotification = RED.notify(
        `WARNING<br /><br />
        Are you <b>SURE</b> you want to overwrite your code
        with the template <b><code>${$('#node-input-templateFolder').val()}</code></b>?<br /><br />
        <b>THIS CANNOT BE UNDONE.</b>`,
        {
            type: 'warning',
            modal: true,
            fixed: true,
            buttons: [
                {
                    text: 'Cancel, don\'t overwrite',
                    class: 'primary',
                    click: function() { // (e) {
                        myNotification.close()
                    }
                },
                {
                    text: 'OK, overwrite',
                    // class:"primary",
                    click: function() { // (e) {
                        loadTemplate()
                        myNotification.close()
                    }
                }
            ]
        }
    )
} // --- End of btnTemplate() --- //

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
        if ( RED.settings.uibuilderTemplates[node.templateFolder] ) {
            $('#node-templSel-info').text(RED.settings.uibuilderTemplates[node.templateFolder].description) }
        // Check if the dependencies are installed, warn if not
        checkDependencies()
        // Unhide the external template name input if external selected
        if ( $('#node-input-templateFolder').val() === 'external' ) {
            $('#et-input').show() }
        else {
            $('#et-input').hide() }
    })
    // Button press for loading new template
    $('#btn-load-template').on('click', function(e) {
        e.preventDefault() // don't trigger normal click event
        btnTemplate()
    })
}

//#endregion ==== Template Management Functions ==== //

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
    $('#node-input-showMsgUib').prop('checked', node.showMsgUib)
}

/** Show what server is in use
 * @param {object} node A reference to the panel's `this` object
 */
function showServerInUse(node) {
    $('#uib-svr-type').text(uibuilder.serverType)
    $('#uib-svr').text(uibuilder.urlPrefix).attr('href', `${uibuilder.urlPrefix}${node.url}`)

    $('#uib-svr-fldr').empty()
    if (node.url) {
        const vslink = vscodeLink(node)
        $('#uib-svr-fldr').append(
            `Server folder: ${vslink.pre}${RED.settings.uibuilderRootFolder}/${node.url}/${$('#node-input-sourceFolder').val()}/${vslink.post}`
        )
    }
} // ---- end of showServerInUse ---- //

/** Handle URL changes
 * See also validateUrl.
 * @param {object} node A reference to the panel's `this` object
 */
function urlChange(node) {
    // Save the old url
    node.oldUrl = node.url

    const newUrl = /** @type {string} */ ($('#node-input-url').val())
    log(`[uibuilder:urlChange] URL changed. New="${newUrl}", old="${node.oldUrl}"`)

    // If the url isn't blank
    if (newUrl) {
        // Show the root URL
        $('#uibuilderurl').prop('href', `${uibuilder.urlPrefix}${newUrl}`)
        // Show the apps list URL
        $('#uib-apps-list').prop('href', `${uibuilder.urlPrefix}uibuilder/apps`)
        // Show this instances details URL
        $('#uibinstanceconf').prop('href', `./uibuilder/instance/${newUrl}?cmd=showinstancesettings`)
    }

    // Update the server in use display
    showServerInUse(node)

    // Update the IDE edit link (editurl)
    vscodeLink(node)
} // ---- end of urlChange ---- //

/** Run when switching to the Files tab
 * @param {object} node A reference to the panel's `this` object
 */
function tabFiles(node) {
    // Build the file list
    getFileList()

    // We only need to do all of this once
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
        /* uiace.editorSession.on('change', function(delta) {
            // delta.start, delta.end, delta.lines, delta.action
            console.log('ACE Editor CHANGE Event', delta)
        }) */
        uiace.editorLoaded = true

        // When inside the editor, allow ctrl-s to save the file rather than the default of saving the web page
        const aceDiv = document.getElementsByClassName('red-ui-editor-text-container')
        aceDiv.item(0).addEventListener('keydown', (evt) => {
            // @ts-ignore
            if ( evt.ctrlKey === true && evt.key === 's' ) {
                evt.preventDefault()
                saveFile()
            }
        })

        // Resize to max available height
        setACEheight()

        // Be friendly and auto-load the initial file via the admin API
        getFileContents()
        fileIsClean(true)
    }
} // ---- End of tabFiles() ---- //

/** Return the correct height of the libraries list
 * @returns {number} Calculated height of the libraries list
 */
function getLibrariesListHeight() {
    return ($('.red-ui-tray-footer').position()).top - ($('#package-list-container').offset()).top + 25
} // ---- End of getLibrariesListHeight() ---- //

/** Run when switching to the Libraries tab
 * @param {object} node A reference to the panel's `this` object
 */
function tabLibraries(node) {
    // ! TODO Improve feedback

    // Setup the package list https://nodered.org/docs/api/ui/editableList/
    $('#node-input-packageList').editableList({
        addItem: function addItem(element, index, data) {
            addPackageRow(node, element, index, data)
        },
        removeItem: removePackageRow, // function(data){},
        // resizeItem: function() {}, // function(_row,_index) {},
        header: $('<div>').append('<b>Installed Packages (Install again to update)</b>'),
        height: getLibrariesListHeight(),
        addButton: true,
        removable: true,
        scrollOnAdd: true,
        sortable: false,
    })

    // reset and populate the list
    $('#node-input-packageList').editableList('empty')
    $('#node-input-packageList').editableList('addItems', Object.keys(packages))

    // spinner
    $('.red-ui-editableList-addButton').after(' <i class="spinner"></i>')
    $('i.spinner').hide()
} // ---- End of tabLibraries() ---- //

/** Prep tabs
 * @param {object} node A reference to the panel's `this` object
 */
function prepTabs(node) {
    const tabs = RED.tabs.create({
        id: 'tabs',
        scrollable: false,
        collapsible: false,
        onchange: function(tab) {
            // Show only the content (i.e. the children) of the selected tabsheet, and hide the others
            $('#tabs-content').children().hide() // eslint-disable-line newline-per-chained-call
            $('#' + tab.id).show()

            // ? Could move these to their own show event. Might even unload some stuff on hide?

            switch (tab.id) {
                case 'tab-files': {
                    tabFiles(node)
                    break
                }

                case 'tab-libraries': {
                    tabLibraries(node)
                    break
                }

                default: {
                    break
                }
            }
        },
    })

    tabs.addTab({ id: 'tab-core',      label: 'Core'      })
    tabs.addTab({ id: 'tab-files',     label: 'Files'     })
    tabs.addTab({ id: 'tab-libraries', label: 'Libraries' })
    // tabs.addTab({ id: 'tab-security',  label: 'Security'  })
    tabs.addTab({ id: 'tab-advanced',  label: 'Advanced'  })
} // ---- End of preTabs ---- //

/** File Editor */
function fileEditor() {
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
        .prop('disabled', true)
    $('#fldr-input-newname').addClass('input-error')
        .on('input', function() {
            if ( /** @type {string} */ ($('#fldr-input-newname').val()).length === 0) {
                $('#fldr-input-newname').addClass('input-error')
                $('#fldr').addClass('input-error')
                    .prop('disabled', true)
            } else {
                $('#fldr-input-newname').removeClass('input-error')
                $('#fldr-new-dialog_new').removeClass('input-error')
                    .prop('disabled', false)
            }
        })
    // @ts-ignore
    $('#fldr-new-dialog').dialog({ // define the dialog box
        autoOpen: false, modal: true, closeOnEscape: true, // eslint-disable-line object-property-newline
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
                        .prop('disabled', true)
                    // @ts-ignore
                    $( this ).dialog( 'close' )
                }
            }, {
                text: 'Cancel',
                click: function() {
                    $('#fldr-input-newname').val(null)
                        .addClass('input-error')
                    $('#fldr-new-dialog_new').addClass('input-error')
                        .prop('disabled', true)
                    // @ts-ignore
                    $( this ).dialog( 'close' )
                }
            },
        ]
    })
        .keyup(function(e) { // make enter key fire the create
            // @ts-ignore
            if (e.keyCode == $.ui.keyCode.ENTER) { // eslint-disable-line eqeqeq
                $('#fldr_new_dialog_new').trigger('click') }
        })
    $('#btn-fldr-new').on('click', function() { // (e) {
        $('#fldr_url').html( /** @type {string} */ ($('#node-input-url').val()) )
        // @ts-ignore
        $('#fldr-new-dialog').dialog('open')
    })
    // Handle the folder delete button
    // @ts-ignore
    $('#fldr-del-dialog').dialog({
        autoOpen: false, modal: true, closeOnEscape: true, // eslint-disable-line object-property-newline
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
            }, {
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
            .css('color', 'brown')
        $('#fldr-del-name').text( /** @type {string} */ ($('#node-input-folder').val()) )
        if ( $('#node-input-folder').val() === 'src' ) {
            if ( $('#node-input-copyIndex').is(':checked') ) {
                $('#fldr-del-recopy').css('color', '')
                    .text('Copy flag is set so the src folder will be recreated and the index.(html|js|css) files will be recopied from the master template.')
            } else {
                $('#fldr-del-recopy').css('color', 'brown')
                    .text('Copy flag is NOT set so the src folder will NOT be recopied from the master template.')
            }
        } else {
            $('#fldr-del-recopy').css('color', '')
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

        saveFile()

    })

    //#region Handle the Delete file button
    // @ts-ignore
    $('#edit_delete_dialog').dialog({
        autoOpen: false, modal: true, closeOnEscape: true, // eslint-disable-line object-property-newline
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
            }, {
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
            .css('color', 'brown')
        $('#edit-delete-name').text($('#node-input-folder').val() + '/' + $('#node-input-filename').val())
        if ( $('#node-input-folder').val() === 'src' ) {
            if ( $('#node-input-copyIndex').is(':checked') ) {
                $('#edit-delete-recopy').css('color', '')
                    .text('Copy flag is set so index.(html|js|css) files will be recopied from master template.')
            } else {
                $('#edit-delete-recopy').css('color', 'brown')
                    .text('Copy flag is NOT set so index.(html|js|css) files will NOT be recopied from master template.')
            }
        } else {
            $('#edit-delete-recopy').css('color', '')
                .text('')
        }
        // @ts-ignore
        $('#edit_delete_dialog').dialog('open')
    })
    //#endregion

    //#region Handle the New file button
    $('#edit_new_dialog_new').addClass('input-error')
        .prop('disabled', true)
    $('#edit-input-newname').addClass('input-error')
        .on('input', function() {
            if ( /** @type {string} */ ($('#edit-input-newname').val()).length === 0) {
                $('#edit-input-newname').addClass('input-error')
                $('#edit_new_dialog_new').addClass('input-error')
                    .prop('disabled', true)
            } else {
                $('#edit-input-newname').removeClass('input-error')
                $('#edit_new_dialog_new').removeClass('input-error')
                    .prop('disabled', false)
            }
        })
    // @ts-ignore
    $('#edit_new_dialog').dialog({
        autoOpen: false, modal: true, closeOnEscape: true, // eslint-disable-line object-property-newline
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
                        .prop('disabled', true)
                    // @ts-ignore
                    $( this ).dialog( 'close' )
                }
            }, {
                text: 'Cancel',
                click: function() {
                    $('#edit-input-newname').val(null)
                        .addClass('input-error')
                    $('#edit_new_dialog_new').addClass('input-error')
                        .prop('disabled', true)
                    // @ts-ignore
                    $( this ).dialog( 'close' )
                }
            },
        ]
    })
        .keyup(function(e) { // make enter key fire the create
            // @ts-ignore
            if (e.keyCode == $.ui.keyCode.ENTER) { // eslint-disable-line eqeqeq
                $('#edit_new_dialog_new').click() }
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
        const value = uiace.editor.getValue()
        RED.editor.editText({
            mode: $('#node-input-format').val(), // mode: $("#node-input-format").val(),
            value: value,
            width: 'Infinity',
            cursor: uiace.editor.getCursorPosition(),
            complete: function(v, cursor) {
                // v contains the returned text
                uiace.editor.setValue(v, -1)
                uiace.editor.gotoLine(cursor.row + 1, cursor.column, false)
                setTimeout(function() {
                    uiace.editor.focus()
                    // Check if anything changed
                    if ( v !== value ) {
                        fileIsClean(false)
                    }
                }, 300)
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
} // ---- End of fileEditor ----

/** Prep for edit
 * @param {*} node -
 */
function onEditPrepare(node) {
    // Add open and docs buttons to top button bar, next to Delete button
    $('<button type="button" title="Open the uibuilder web page" id="btntopopen" class="ui-button ui-corner-all ui-widget leftButton"><i class="fa fa-globe" aria-hidden="true"></i> Open</button>')
        .on('click', (evt) => {
            evt.preventDefault()
            window.open(`${uibuilder.urlPrefix}${$('#node-input-url').val()}`, '_blank')
        })
        .appendTo($('div.red-ui-tray-toolbar'))
    $('<button type="button" title="Open uibuilder Documentation" class="ui-button ui-corner-all ui-widget leftButton"><i class="fa fa-book" aria-hidden="true"></i> Docs</button>')
        .on('click', (evt) => {
            evt.preventDefault()
            RED.sidebar.help.show('uibuilder')
            window.open('./uibuilder/docs', '_blank')
        })
        .appendTo($('div.red-ui-tray-toolbar'))
    // Add clickable label that opens in vscode
    const vsc = vscodeLink(node)
    $(`<button type="button" title="Open instance code folder in VSCode" aria-label="Link that opens the instance code folder in VSCode." class="ui-button ui-corner-all ui-widget leftButton">${vsc.icon}</button>`)
        .on('click', (evt) => {
            evt.preventDefault()
            window.open(vsc.url)
        })
        .appendTo($('div.red-ui-tray-toolbar'))

    getFolders()

    // console.log('>> ONEDITPREPARE: NODE >>', node)

    // Show uibuilder version
    $('#uib_version').text(RED.settings.uibuilderCurrentVersion)

    // Bug fix for messed up recording of template up to uib v3.3, fixed in v4
    if ( node.templateFolder === undefined || node.templateFolder === '' ) node.templateFolder = defaultTemplate

    // Set the checkbox initial states
    setInitialStates(node)

    prepTabs(node)

    // Set sourceFolder dropdown
    $(`#node-input-sourceFolder option[value="${node.sourceFolder || 'src'}"]`).prop('selected', true)
    $('#node-input-sourceFolder').val(node.sourceFolder || 'src')

    // Configure the template dropdown & setup button handlers
    templateSettings(node)

    // security settings
    // securitySettings()

    // Show the server in use
    showServerInUse(node)

    // ~~Update web links on url change~~ Don't do this here because we need to force a deploy - see onEditChange
    // $('#node-input-url').on('change', function() {
    //     urlChange.call(this, node)
    // })

    // Show url errors for 1 time when panel 1st opens (after that, the verify fn takes over)
    if ( node.url === undefined || node.url === '' ) {
        enableEdit(node.urlErrors, Object.keys(node.urlErrors).length < 1) }

    fileEditor()

    uibuilder.doTooltips('.ti-edit-panel') // Do this at the end
} // ---- End of oneditprepare ---- //

/** Handles the save event when editing a node in the Node-RED editor.
 *
 * @param {object} node - The node being edited.
 *
 * @description
 * This function performs the following tasks:
 * 1. Logs the current context (`this`).
 * 2. Destroys the ACE editor instance if it is loaded.
 * 3. Checks if the URL has been changed and updates the old URL if necessary.
 * 4. Updates the IDE edit link if the URL has changed.
 * 5. Logs the URL change.
 * 6. Resets the old URL if it is no longer needed.
 * 7. Updates the deployed version if there are changes or if an update is required.
 */
function onEditSave(node) {
    // console.log('>>>> node >>>', node)

    // Get rid of the editor
    if ( uiace.editorLoaded === true ) {
        uiace.editor.destroy()
        delete uiace.editor
        uiace.editorLoaded = false
    }

    // Check for url rename, set/reset oldUrl - note that validation of new url is done in the validate function
    // If the url has changed (browser val != node val), process the change
    if ( $('#node-input-url').val() !== node.url ) {
        urlChange(node)
    } else if ( node.oldUrl !== undefined ) {
        // URL not changed so reset the oldUrl
        node.oldUrl = undefined
    }

    // If something has changed or if something must change - a deploy is needed so update the deployed version
    if ( node.changed || node.mustChange ) node.deployedVersion = RED.settings.uibuilderCurrentVersion
} // ---- End of onEditSave ---- //

//#endregion ------------------------------------------------- //

// Register the node type, defaults and set up the edit fns
RED.nodes.registerType(moduleName, {
    //#region --- options --- //
    defaults: {
        name: { value: '' },
        topic: { value: '' },
        url: { required: true, validate: validateUrl },
        okToGo: {}, // Set by validateUrl, tells runtime if we are good to configure the node
        fwdInMessages: { value: false },   // Should we send input msg's direct to output as well as the front-end?
        allowScripts: { value: false },    // Should we allow msg's to send JavaScript to the front-end?
        allowStyles: { value: false },     // Should we allow msg's to send CSS styles to the front-end?
        copyIndex: { value: true },        // DEPRECATED Should the default template files be copied to the instance src folder?
        templateFolder: { value: defaultTemplate },  // Folder for selected template
        extTemplate: { value: '' }, // Only if templateFolder=external, degit name
        showfolder: { value: false },      // Should a web index view of all source files be made available?
        oldUrl: { value: undefined },      // If the url has been changed, this is the previous url
        reload: { value: false },          // If true, all connected clients will be reloaded if a file is changed on the edit screens
        sourceFolder: { value: 'src', required: true, }, // Which folder to use for front-end code? (src or dist)
        deployedVersion: { validate: validateVersion },
        showMsgUib: { value: false },    // Show msg._uib in standard msgs (client id, ip, page name)
        title: { value: '' },    // Optional short description for this instance
        descr: { value: '' },    // Optional long description for this instance
        editurl: {}, // shortcut url for editing the FE code
    },
    inputs: 1,
    inputLabels: 'Msg to send to front-end',
    outputs: 2,
    outputLabels: ['Data from front-end', 'Control Msgs from front-end'],
    // icon: 'node-white.svg',
    icon: 'node-blue-inverted.svg',
    // icon: 'semanticWebWhite.svg',
    label: function () {
        const url = this.url ? `<${this.url}>` : '<no url>'
        const name = this.name ? `${this.name} ` : ''
        return `${name}${url}`
    },
    paletteLabel: moduleName,
    category: uibuilder.paletteCategory,
    color: 'var(--uib-node-colour)', // '#E6E0F8'
    // credentials: {
    //     jwtSecret: { type: 'password' },  // text or password
    // },
    //#endregion --- options --- //

    /** Prepares the Editor panel */
    oneditprepare: function() { onEditPrepare(this) },

    /** Runs BEFORE save (Actually when Done button pressed)
     * @this {RED}
     */
    oneditsave: function() { onEditSave(this) },

    /** Runs before cancel */
    oneditcancel: function() {
        // Reset the url in editorInstances[this.id] if cancelled
        // editorInstances[this.id] = this.url

        // Get rid of the editor
        if ( uiace.editorLoaded === true ) {
            uiace.editor.destroy()
            delete uiace.editor
            uiace.editorLoaded = false
        }
    }, // ---- End of oneditcancel ---- //

    /** Handle window resizing for the editor */
    oneditresize: function() { // (size) {
        // console.log('UIBUILDER WIDTH: ', $('#red-ui-editor-stack > div > div.red-ui-tray-body-wrapper > div > div:nth-child(2) > div:nth-child(1)').css('width'))

        setACEheight()

        // Set correct height of the libraries list
        try {
            $('#node-input-packageList').editableList('height', getLibrariesListHeight())
        } catch (e) {}
    }, // ---- End of oneditcancel ---- //

    /** Show notification warning before allowing delete */
    oneditdelete: function() {
        // Update the deployed instances list (also updates this.isDeployed)
        updateDeployedInstances(this)

        // Remove the recorded instance
        // delete editorInstances[this.id]
        log('[uib] >> deleting >> isDeployed? ', this.isDeployed, uibuilder.deployedUibInstances[this.id] !== undefined)

        // Only warn if the node has been deployed
        if ( this.isDeployed ) {
            const that = this
            const myNotify = RED.notify(`<b>DELETE</b>: <p>You are deleting a uibuilder instance with url <i>${this.url}</i>.<br>Would you like to also delete the folder?<br><b>WARNING</b>: This cannot be undone.</p>`, {
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
                                url: './uibuilder/admin/' + that.url,  // v3 api
                                data: {
                                    'cmd': 'deleteondelete',
                                },
                                beforeSend: function(jqXHR) {
                                    const authTokens = RED.settings.get('auth-tokens')
                                    if (authTokens) {
                                        jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
                                    }
                                },
                            })
                                .fail(function(jqXHR, textStatus, errorThrown) {
                                    console.error( '[uibuilder:oneditdelete:PUT] Error ' + textStatus, errorThrown )
                                    RED.notify(`uibuilder: Request url folder delete - error.<br>Folder will not be deleted, please delete manually.<br>${errorThrown}`, { type: 'error' })
                                })

                            myNotify.close()
                            RED.notify(`The folder <i>${that.url}</i> will be deleted when you redeploy.`, { type: 'compact' })
                        }
                    },
                    {
                        text: 'NO',
                        class: 'primary',
                        click: function() { // (e) {
                            myNotify.close()
                        }
                    }
                ]
            })
        }
    }, // ---- End of oneditdelete ---- //
}) // ---- End of registerType() ---- //
