/**
 * @description Overlay window for displaying messages and notifications.
 * Included in the UI module and from there into the main uibuilder module.
 * @license Apache-2.0
 * @author Julian Knight (Totally Information)
 * @copyright (c) 2025-2025 Julian Knight (Totally Information)
 */

/** Creates and displays an overlay window with customizable content and behavior
 * @param {object} options - Configuration options for the overlay
 *   @param {string} [options.content] - Main content (text or HTML) to display
 *   @param {string} [options.title] - Optional title above the main content
 *   @param {string} [options.icon] - Optional icon to display left of title (HTML or text)
 *   @param {string} [options.type] - Overlay type: 'success', 'info', 'warning', or 'error'
 *   @param {boolean} [options.showDismiss] - Whether to show dismiss button (auto-determined if not set)
 *   @param {number|null} [options.autoClose] - Auto-close delay in seconds (null for no auto-close)
 *   @param {boolean} [options.time] - Show timestamp in overlay (default: true)
 * @returns {object} Object with close() method to manually close the overlay
 */
export function showOverlay(options = {}) {
    const {
        content = '',
        title = '',
        icon = '',
        type = 'info',
        showDismiss,
        autoClose = 5,
        time = true,
    } = options

    const overlayContainerId = 'uib-info-overlay'

    // Get or create the main overlay container
    let overlayContainer = document.getElementById(overlayContainerId)
    if (!overlayContainer) {
        overlayContainer = document.createElement('div')
        overlayContainer.id = overlayContainerId
        document.body.appendChild(overlayContainer)
        console.log('>> SHOW OVERLAY >>', options, document.getElementById(overlayContainerId))
    }

    // Generate unique ID for this overlay entry
    const entryId = `overlay-entry-${Date.now()}-${Math.random().toString(36)
        .substr(2, 9)}`

    // Create individual overlay entry
    const overlayEntry = document.createElement('div')
    overlayEntry.id = entryId
    overlayEntry.style.marginBottom = '0.5rem'

    // Define type-specific styles
    const typeStyles = {
        info: {
            iconDefault: 'ℹ️',
            titleDefault: 'Information',
            color: 'hsl(188.2deg 77.78% 40.59%)',
        },
        success: {
            iconDefault: '✅',
            titleDefault: 'Success',
            color: 'hsl(133.7deg 61.35% 40.59%)',
        },
        warning: {
            iconDefault: '⚠️',
            titleDefault: 'Warning',
            color: 'hsl(35.19deg 84.38% 62.35%)',
        },
        error: {
            iconDefault: '❌',
            titleDefault: 'Error',
            color: 'hsl(2.74deg 92.59% 62.94%)',
        },
    }

    // @ts-ignore
    const currentTypeStyle = typeStyles[type] || typeStyles.info

    // Determine if dismiss button should be shown
    const shouldShowDismiss = showDismiss !== undefined ? showDismiss : (autoClose === null)

    // Create content HTML
    const iconHtml = icon || currentTypeStyle.iconDefault
    const titleText = title || currentTypeStyle.titleDefault

    // Generate timestamp if time option is enabled
    let timeHtml = ''
    if (time) {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')
        const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        timeHtml = `<div class="uib-overlay-time" style="font-size: 0.8em; color: var(--text3, #999); margin-left: auto; margin-right: ${shouldShowDismiss ? '0.5rem' : '0'};">${timestamp}</div>`
    }

    overlayEntry.innerHTML = /* html */ `
        <div class="uib-overlay-entry" style="--callout-color:${currentTypeStyle.color};">
            <div class="uib-overlay-header">
                <div class="uib-overlay-icon">${iconHtml}</div>
                <div class="uib-overlay-title">${titleText}</div>
                ${timeHtml}
                ${shouldShowDismiss
                    ? `<button class="uib-overlay-dismiss" data-entry-id="${entryId}" title="Close">×</button>`
                    : ''}
            </div>
            <div class="uib-overlay-content">
                ${content}
            </div>
        </div>
    `

    // Add to overlay container at the top, sliding existing entries down
    if (overlayContainer.children.length > 0) {
        // Insert new entry at the top
        overlayContainer.insertBefore(overlayEntry, overlayContainer.firstChild)
    } else {
        // First entry, just add it normally
        overlayContainer.appendChild(overlayEntry)
    }

    // Close function for this specific entry
    const closeOverlayEntry = () => {
        const entry = document.getElementById(entryId)
        if (!entry) return

        entry.style.animation = 'slideOut 0.3s ease-in'
        setTimeout(() => {
            if (entry.parentNode) {
                entry.remove()
                // Remove the main container if no entries remain
                // const container = document.getElementById(overlayContainerId)
                // if (container && container.children.length === 0) {
                //     container.remove()
                // }
            }
        }, 300)
    }

    // Add dismiss button event listener
    const dismissBtn = overlayEntry.querySelector('.uib-overlay-dismiss')
    if (dismissBtn) {
        dismissBtn.addEventListener('click', closeOverlayEntry)
    }

    // Set up auto-close if specified
    let autoCloseTimer = null
    if (autoClose !== null && autoClose > 0) {
        autoCloseTimer = setTimeout(closeOverlayEntry, autoClose * 1000)
    }

    // Return control object
    return {
        close: () => {
            if (autoCloseTimer) {
                clearTimeout(autoCloseTimer)
            }
            closeOverlayEntry()
        },
        id: entryId,
    }
}

export default showOverlay
