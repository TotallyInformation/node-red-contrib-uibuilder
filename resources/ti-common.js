/** Common functions and data for UIBUILDER nodes
 * Load as: ./resources/@totallyinformation/node-red-contrib-uibuilder/ti-common.js
 */

/** Add a "uibuilder" object to the Node-RED Editor
 * To contain common functions, variables and constants for UIBUILDER nodes
 */
window['uibuilder'] = {
    /** Add jQuery UI formatted tooltips
     * @param {string} baseSelector CSS Selector that is the top of the hierarchy to impact
     */
    doTooltips: function doTooltips(baseSelector) {
        // Select our page elements
        $(baseSelector).tooltip({
            items: 'img[alt], [aria-label], [title]',
            track: true,
            content: function() {
                const element = $( this )
                if ( element.is( '[title]' ) ) {
                    return element.attr( 'title' )
                } else if ( element.is( '[aria-label]' ) ) {
                    return element.attr( 'aria-label' )
                } else if ( element.is( 'img[alt]' ) ) {
                    return element.attr( 'alt' )
                } else return ''
            },
        })
    }
}
