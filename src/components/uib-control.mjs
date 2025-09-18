/** Define a new zero dependency custom web component ECMA module that can be used as an HTML tag
 *
 * Version: See the class code
 *
 */
/** Copyright (c) 2025-2025 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk, https://github.com/TotallyInformation
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import TiBaseComponent from './ti-base-component.mjs'

/** Only use a template if you want to isolate the code and CSS using the Shadow DOM */
const template = document.createElement('template')
template.innerHTML = /* html */`
    <style>
        :host {
            display: block;   /* default is inline */
            contain: content; /* performance boost */
            position: fixed;  /* Float over all content */
            top: var(--uib-control-top, 1.25rem);
            right: var(--uib-control-right, 1.25rem);
            z-index: var(--uib-control-z-index, 9999); /* Ensure it floats above other content */
            max-width: var(--uib-control-max-width, 18.75rem);
        }
        
        .control-container {
            background: var(--uib-control-bg, hsl(0, 0%, 98%));
            border: var(--uib-control-border, 1px solid hsl(0, 0%, 85%));
            border-radius: var(--uib-control-border-radius, 0.5rem);
            box-shadow: var(--uib-control-shadow, 0 0.25rem 0.75rem hsla(0, 0%, 0%, 0.15));
            transition: var(--uib-control-transition, all 0.3s ease);
            position: relative;
        }
        
        .control-container.dragging {
            transition: none;
            user-select: none;
            z-index: 10000;
        }
        
        .emoji-toggle {
            cursor: pointer;
            padding: var(--uib-control-emoji-padding, 0.5rem 0.75rem);
            font-size: var(--uib-control-emoji-size, 1.5rem);
            background: transparent;
            border: none;
            display: block;
            width: 100%;
            text-align: center;
            user-select: none;
            transition: transform 0.2s ease;
            position: relative;
        }
        
        .emoji-toggle.dragging {
            cursor: grabbing;
        }
        
        .emoji-toggle:hover {
            transform: scale(1.1);
        }
        
        .emoji-toggle:focus {
            outline: 0.125rem solid var(--uib-control-focus-color, hsl(220, 90%, 50%));
            outline-offset: 0.125rem;
        }
        
        .content-box {
            padding: 0;
            border-top: var(--uib-control-content-border, 1px solid hsl(0, 0%, 90%));
            background: var(--uib-control-content-bg, hsl(0, 0%, 100%));
            display: none;
            min-width: var(--uib-control-content-min-width, 15.625rem);
        }
        
        .content-box.show {
            display: block;
            animation: fadeIn 0.2s ease-out;
        }
        
        /* Tab navigation styles */
        .tab-navigation {
            display: flex;
            border-bottom: 1px solid var(--uib-control-content-border, hsl(0, 0%, 90%));
            background: var(--uib-control-bg, hsl(0, 0%, 98%));
        }
        
        .tab-button {
            flex: 1;
            padding: 0.75rem 1rem;
            border: none;
            background: transparent;
            color: var(--uib-control-text-color, hsl(0, 0%, 20%));
            font-size: var(--uib-control-font-size, 0.9rem);
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border-bottom: 2px solid transparent;
        }
        
        .tab-button:hover {
            background: var(--uib-control-content-bg, hsl(0, 0%, 100%));
        }
        
        .tab-button:focus {
            outline: 0.125rem solid var(--uib-control-focus-color, hsl(220, 90%, 50%));
            outline-offset: -0.125rem;
            z-index: 1;
            position: relative;
        }
        
        .tab-button.active {
            background: var(--uib-control-content-bg, hsl(0, 0%, 100%));
            border-bottom-color: var(--uib-control-focus-color, hsl(220, 90%, 50%));
            color: var(--uib-control-focus-color, hsl(220, 90%, 50%));
        }
        
        /* Tab content styles */
        .tab-content {
            position: relative;
        }
        
        .tab-panel {
            padding: var(--uib-control-content-padding, 1rem);
            display: none;
        }
        
        .tab-panel.active {
            display: block;
        }
        
        .tab-panel:focus {
            outline: none;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-0.625rem); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Default content styling */
        .theme-toggle-section {
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--uib-control-content-border, hsl(0, 0%, 90%));
        }
        
        .theme-label {
            display: inline-block;
            font-size: var(--uib-control-font-size, 0.9rem);
            font-weight: 500;
            color: var(--uib-control-text-color, hsl(0, 0%, 20%));
            margin-right: 0.5rem;
        }
        
        .theme-buttons-container {
            display: inline-flex;
            border: 1px solid var(--uib-control-border, hsl(0, 0%, 85%));
            border-radius: 0.375rem;
            overflow: hidden;
            background: var(--uib-control-content-bg, hsl(0, 0%, 100%));
        }
        
        .theme-button {
            padding: 0.375rem 0.75rem;
            border: none;
            background: var(--uib-control-content-bg, hsl(0, 0%, 100%));
            color: var(--uib-control-text-color, hsl(0, 0%, 20%));
            font-size: var(--uib-control-font-size, 0.9rem);
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border-right: 1px solid var(--uib-control-border, hsl(0, 0%, 85%));
            min-width: 2.5rem;
            text-align: center;
        }
        
        .theme-button:last-child {
            border-right: none;
        }
        
        .theme-button:hover {
            background: var(--uib-control-bg, hsl(0, 0%, 98%));
        }
        
        .theme-button:focus {
            outline: 0.125rem solid var(--uib-control-focus-color, hsl(220, 90%, 50%));
            outline-offset: -0.125rem;
            z-index: 1;
            position: relative;
        }
        
        .theme-button.active {
            background: var(--uib-control-focus-color, hsl(220, 90%, 50%));
            color: hsl(0, 0%, 100%);
        }
        
        .theme-button.active:hover {
            background: hsl(220, 90%, 45%);
        }
        
        .content-box p {
            margin: 0 0 0.5rem 0;
            color: var(--uib-control-text-color, hsl(0, 0%, 20%));
            font-size: var(--uib-control-font-size, 0.9rem);
            line-height: 1.4;
        }
        
        .content-box p:last-child {
            margin-bottom: 0;
        }
    </style>
    <div class="control-container">
        <button class="emoji-toggle" type="button" aria-expanded="false" aria-label="Toggle control panel (click) or drag to move">
            🎛️
        </button>
        <div class="content-box" role="region" aria-label="Control panel content">
            <div class="tab-navigation" role="tablist" aria-label="Content tabs">
                <button id="tab-btn-1" class="tab-button active" type="button" role="tab" aria-selected="true" aria-controls="tab1">
                    Settings
                </button>
                <button id="tab-btn-2" class="tab-button" type="button" role="tab" aria-selected="false" aria-controls="tab2">
                    Page Info
                </button>
            </div>
            <div class="tab-content">
                <div id="tab1" class="tab-panel active" role="tabpanel" aria-labelledby="tab-btn-1" tabindex="0">
                    <div class="theme-toggle-section">
                        <label class="theme-label">Theme:</label>
                        <div class="theme-buttons-container" role="radiogroup" aria-label="Theme selection">
                            <button id="theme-auto" class="theme-button active" type="button" data-theme="auto" aria-pressed="true">
                                Auto
                            </button>
                            <button id="theme-light" class="theme-button" type="button" data-theme="light" aria-pressed="false">
                                Light
                            </button>
                            <button id="theme-dark" class="theme-button" type="button" data-theme="dark" aria-pressed="false">
                                Dark
                            </button>
                        </div>
                    </div>
                    <slot></slot>
                </div>
                <div id="tab2" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-2" tabindex="0">
                    <div id="viewportSize">Window Width: -- px, Height: -- px</div>
                    <div id="clientSize">Client Width: -- px, Height: -- px</div>
                </div>
            </div>
        </div>
    </div>
`
/** Only use this if using Light DOM but want scoped styles */
// const styles = `
//     uib-control {
//         /* Scoped to this component */
//     }
// `

/**
 * @class
 * @augments TiBaseComponent
 * @description Define a new zero dependency custom web component that displays as a floating control panel.
 * By default shows just an emoji toggle button that floats over all page content. When clicked,
 * toggles between showing just the emoji and displaying a content box with additional content.
 *
 * @element uib-control
 * @license Apache-2.0

 * METHODS FROM BASE: (see TiBaseComponent)
 * STANDARD METHODS:
  * @function attributeChangedCallback Called when an attribute is added, removed, updated or replaced
  * @function connectedCallback Called when the element is added to a document
  * @function constructor Construct the component
  * @function disconnectedCallback Called when the element is removed from a document

 * OTHER METHODS:
  * @function _setupToggle Private method to setup toggle functionality
  * @function _setupThemeToggle Private method to setup theme toggle functionality
  * @function _setupTabs Private method to setup tab functionality
  * @function _setupDrag Private method to setup drag functionality
  * @function _savePosition Private method to save position to localStorage
  * @function _restorePosition Private method to restore position from localStorage
  * @function _getCurrentTheme Private method to get current theme setting
  * @function _setTheme Private method to set theme mode

 * CUSTOM EVENTS:
  * "uib-control:connected" - When an instance of the component is attached to the DOM. `evt.details` contains the details of the element.
  * "uib-control:ready" - Alias for connected. The instance can handle property & attribute changes
  * "uib-control:disconnected" - When an instance of the component is removed from the DOM. `evt.details` contains the details of the element.
  * "uib-control:attribChanged" - When a watched attribute changes. `evt.details.data` contains the details of the change.
  * "uib-control:toggle" - When the control panel is toggled. `evt.details.data.expanded` indicates whether panel is expanded.
  * "uib-control:drag-end" - When dragging ends. `evt.details.data` contains x and y coordinates.
  * "uib-control:position-restored" - When saved position is restored. `evt.details.data` contains position and timestamp.
  * "uib-control:theme-changed" - When theme is changed. `evt.details.data.theme` contains the selected theme.
  * "uib-control:tab-changed" - When tab is changed. `evt.details.data.activeTab` contains the active tab ID.
  * NOTE that listeners can be attached either to the `document` or to the specific element instance.

 * Standard watched attributes (common across all my components):
  * @property {string|boolean} inherit-style - Optional. Load external styles into component (only useful if using template). If present but empty, will default to './index.css'. Optionally give a URL to load.
  * @property {string} name - Optional. HTML name attribute. Included in output _meta prop.

 * Other watched attributes:
  * @property {boolean} close-on-outside-click - Optional. If present, clicking outside the component will close the panel.
  * @property {string} save-position - Optional. If present, saves the dragged position to localStorage. Value is used as storage key (defaults to 'uib-control-position').

 * PROPS FROM BASE: (see TiBaseComponent)
 * OTHER STANDARD PROPS:
  * @property {string} componentVersion Static. The component version string (date updated). Also has a getter that returns component and base version strings.

 * Other props:
  * By default, all attributes are also created as properties

 NB: properties marked with 💫 are dynamic and have getters/setters.

 * CSS Custom Properties (for theming):
  * --uib-control-top: Top position (default: 1.25rem)
  * --uib-control-right: Right position (default: 1.25rem)
  * --uib-control-z-index: Z-index for layering (default: 9999)
  * --uib-control-max-width: Maximum width of component (default: 18.75rem)
  * --uib-control-bg: Background color (default: hsl(0, 0%, 98%))
  * --uib-control-border: Border style (default: 1px solid hsl(0, 0%, 85%))
  * --uib-control-border-radius: Border radius (default: 0.5rem)
  * --uib-control-shadow: Box shadow (default: 0 0.25rem 0.75rem hsla(0, 0%, 0%, 0.15))
  * --uib-control-emoji-size: Size of emoji toggle (default: 1.5rem)
  * --uib-control-content-padding: Content padding (default: 1rem)

 * @slot Container contents - Content displayed in the expandable panel

 * @example
  * <uib-control name="myControl">
  *   <p>Your control panel content here</p>
  * </uib-control>

 * @example
  * <uib-control close-on-outside-click save-position="my-panel-pos">
  *   <div>
  *     <h3>Draggable Control Panel</h3>
  *     <button>Action 1</button>
  *     <button>Action 2</button>
  *   </div>
  * </uib-control>

 * @example
  * <!-- Save position with default key -->
  * <uib-control save-position>
  *   <p>This panel remembers its position</p>
  * </uib-control>

 * See https://github.com/runem/web-component-analyzer?tab=readme-ov-file#-how-to-document-your-components-using-jsdoc
 */
class UibControl extends TiBaseComponent {
    /** Component version */
    static componentVersion = '2025-08-28'

    // Unique key for local storage
    #uniqueKey
    #toggleButton
    #dragHandlers = {
        mouseMove: null,
        mouseUp: null,
        touchMove: null,
        touchEnd: null,
    }
    #toggleHandlers = {
        click: null,
        keydown: null,
        outsideClick: null,
        touchStart: null,
        touchEnd: null,
        themeChange: null,
        tabClick: null,
        tabKey: null,
    }
    #resizeHandler = null

    /** Makes HTML attribute change watched
     * @returns {Array<string>} List of all of the html attribs (props) listened to
     */
    static get observedAttributes() {
        return [
            // Standard watched attributes:
            'inherit-style', 'name',
            // Other watched attributes:
            'close-on-outside-click', 'save-position',
        ]
    }

    /** NB: Attributes not available here - use connectedCallback to reference */
    constructor() {
        super()
        // Only attach the shadow dom if code and style isolation is needed - comment out if shadow dom not required
        if (template && template.content) this._construct(template.content.cloneNode(true))
        // Otherwise, if component styles are needed, use the following instead:
        // this.prependStylesheet(styles, 0)
    }

    // #region ---- Internal methods ----

    /** Setup the toggle functionality for the emoji button
     * @private
     */
    _setupToggle() {
        const toggleButton = this.#toggleButton = this.shadowRoot?.querySelector('.emoji-toggle')
        const contentBox = this.shadowRoot?.querySelector('.content-box')

        if (!toggleButton || !contentBox) return

        let isExpanded = false

        // Create handler functions for cleanup
        const clickHandler = () => {
            isExpanded = !isExpanded

            if (isExpanded) {
                contentBox.classList.add('show')
                toggleButton.setAttribute('aria-expanded', 'true')
            } else {
                contentBox.classList.remove('show')
                toggleButton.setAttribute('aria-expanded', 'false')
            }

            // Dispatch custom event for external listeners
            this._event('toggle', { expanded: isExpanded, })
        }

        const keydownHandler = (evt) => {
            if (evt instanceof KeyboardEvent && evt.key === 'Escape' && isExpanded) {
                isExpanded = false
                contentBox.classList.remove('show')
                toggleButton.setAttribute('aria-expanded', 'false')
                this._event('toggle', { expanded: false, })
            }
        }

        // Add event listeners
        toggleButton.addEventListener('click', clickHandler)
        toggleButton.addEventListener('keydown', keydownHandler)

        // For better mobile support, also handle touch events for toggle
        let touchStartTime = 0
        let touchStartX = 0
        let touchStartY = 0

        const touchStartHandler = (evt) => {
            if (evt.touches.length === 1) {
                touchStartTime = Date.now()
                touchStartX = evt.touches[0].clientX
                touchStartY = evt.touches[0].clientY
            }
        }

        const touchEndHandler = (evt) => {
            if (evt.changedTouches.length === 1) {
                const touchEndTime = Date.now()
                const touchEndX = evt.changedTouches[0].clientX
                const touchEndY = evt.changedTouches[0].clientY

                const duration = touchEndTime - touchStartTime
                const distance = Math.sqrt(
                    Math.pow(touchEndX - touchStartX, 2)
                    + Math.pow(touchEndY - touchStartY, 2)
                )

                // If it's a quick tap with minimal movement, treat as click
                if (duration < 300 && distance < 10) {
                    clickHandler()
                    evt.preventDefault()
                }
            }
        }

        // Add touch handlers for better mobile click detection
        toggleButton.addEventListener('touchstart', touchStartHandler, { passive: true, })
        toggleButton.addEventListener('touchend', touchEndHandler, { passive: false, })

        // Store handlers for cleanup
        this.#toggleHandlers.click = clickHandler
        this.#toggleHandlers.keydown = keydownHandler
        this.#toggleHandlers.touchStart = touchStartHandler
        this.#toggleHandlers.touchEnd = touchEndHandler

        // Optional: Close when clicking outside (if desired)
        if (this.hasAttribute('close-on-outside-click')) {
            const outsideClickHandler = (evt) => {
                if (isExpanded && evt.target instanceof Node && !this.contains(evt.target)) {
                    isExpanded = false
                    contentBox.classList.remove('show')
                    toggleButton.setAttribute('aria-expanded', 'false')
                    this._event('toggle', { expanded: false, })
                }
            }

            document.addEventListener('click', outsideClickHandler)
            this.#toggleHandlers.outsideClick = outsideClickHandler
        }

        // Setup theme toggle functionality
        this._setupThemeToggle()

        // Setup tab functionality
        this._setupTabs()
    }

    /** Setup theme toggle functionality
     * @private
     */
    _setupThemeToggle() {
        const themeButtonsContainer = this.shadowRoot?.querySelector('.theme-buttons-container')
        const themeButtons = this.shadowRoot?.querySelectorAll('.theme-button')
        if (!themeButtonsContainer || !themeButtons?.length) return

        // Get current theme and set initial state
        const currentTheme = this._getCurrentTheme()
        this._updateButtonStates(themeButtons, currentTheme)

        // Handle theme button clicks
        const themeChangeHandler = (evt) => {
            if (!(evt.target instanceof HTMLButtonElement) || !evt.target.classList.contains('theme-button')) return

            evt.preventDefault()

            const selectedTheme = evt.target.getAttribute('data-theme')
            if (!selectedTheme) return

            // Update button states and apply theme
            this._updateButtonStates(themeButtons, selectedTheme)
            this._setTheme(selectedTheme)

            // Dispatch custom event for external listeners
            this._event('theme-changed', { theme: selectedTheme, })
        }

        themeButtonsContainer.addEventListener('click', themeChangeHandler)

        // Store handler for cleanup
        this.#toggleHandlers.themeChange = themeChangeHandler
    }

    /** Update the theme button states
     * @private
     * @param {NodeList} buttons - The theme button elements
     * @param {string} activeTheme - The theme to set as active
     */
    _updateButtonStates(buttons, activeTheme) {
        buttons.forEach((button) => {
            if (!(button instanceof HTMLButtonElement)) return

            const buttonTheme = button.getAttribute('data-theme')
            const isActive = buttonTheme === activeTheme

            if (isActive) {
                button.classList.add('active')
                button.setAttribute('aria-pressed', 'true')
            } else {
                button.classList.remove('active')
                button.setAttribute('aria-pressed', 'false')
            }
        })
    }

    /** Setup tab functionality
     * @private
     */
    _setupTabs() {
        const tabNavigation = this.shadowRoot?.querySelector('.tab-navigation')
        const tabButtons = this.shadowRoot?.querySelectorAll('.tab-button')
        const tabPanels = this.shadowRoot?.querySelectorAll('.tab-panel')

        if (!tabNavigation || !tabButtons?.length || !tabPanels?.length) return

        // Handle tab button clicks
        const tabClickHandler = (evt) => {
            if (!(evt.target instanceof HTMLButtonElement) || !evt.target.classList.contains('tab-button')) return

            evt.preventDefault()

            const clickedButton = evt.target
            const targetPanelId = clickedButton.getAttribute('aria-controls')
            if (!targetPanelId) return

            // Update button states
            tabButtons.forEach((button) => {
                if (!(button instanceof HTMLButtonElement)) return

                const isActive = button === clickedButton
                if (isActive) {
                    button.classList.add('active')
                    button.setAttribute('aria-selected', 'true')
                } else {
                    button.classList.remove('active')
                    button.setAttribute('aria-selected', 'false')
                }
            })

            // Update panel visibility
            tabPanels.forEach((panel) => {
                if (!(panel instanceof HTMLElement)) return

                const isActive = panel.id === targetPanelId
                if (isActive) {
                    panel.classList.add('active')
                } else {
                    panel.classList.remove('active')
                }
            })

            // Dispatch custom event for external listeners
            this._event('tab-changed', { activeTab: targetPanelId, })
        }

        // Handle keyboard navigation
        const tabKeyHandler = (evt) => {
            if (!(evt.target instanceof HTMLButtonElement) || !evt.target.classList.contains('tab-button')) return

            const currentIndex = Array.from(tabButtons).indexOf(evt.target)
            let targetIndex = currentIndex

            switch (evt.key) {
                case 'ArrowLeft':
                    targetIndex = currentIndex > 0 ? currentIndex - 1 : tabButtons.length - 1
                    evt.preventDefault()
                    break
                case 'ArrowRight':
                    targetIndex = currentIndex < tabButtons.length - 1 ? currentIndex + 1 : 0
                    evt.preventDefault()
                    break
                case 'Home':
                    targetIndex = 0
                    evt.preventDefault()
                    break
                case 'End':
                    targetIndex = tabButtons.length - 1
                    evt.preventDefault()
                    break
                default:
                    return
            }

            const targetButton = tabButtons[targetIndex]
            if (targetButton instanceof HTMLButtonElement) {
                targetButton.focus()
                targetButton.click()
            }
        }

        tabNavigation.addEventListener('click', tabClickHandler)
        tabNavigation.addEventListener('keydown', tabKeyHandler)

        // Store handlers for cleanup
        this.#toggleHandlers.tabClick = tabClickHandler
        this.#toggleHandlers.tabKey = tabKeyHandler
    }

    /** Get the current theme setting
     * @private
     * @returns {string} Current theme ('light', 'dark', or 'auto')
     */
    _getCurrentTheme() {
        const htmlElement = document.documentElement

        if (htmlElement.classList.contains('light')) {
            return 'light'
        } else if (htmlElement.classList.contains('dark')) {
            return 'dark'
        }

        // Check localStorage for saved preference
        try {
            const savedTheme = localStorage.getItem('uib-control-theme')
            if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
                return savedTheme
            }
        } catch (error) {
            console.warn('Failed to read theme preference:', error)
        }

        return 'auto' // Default to browser preference
    }

    /** Set the theme mode
     * @private
     * @param {string} theme - Theme mode ('light', 'dark', or 'auto')
     */
    _setTheme(theme) {
        const htmlElement = document.documentElement

        // Remove existing theme classes
        htmlElement.classList.remove('light', 'dark')

        // Apply new theme
        switch (theme) {
            case 'light':
                htmlElement.classList.add('light')
                break
            case 'dark':
                htmlElement.classList.add('dark')
                break
            case 'auto':
                // No class = browser preference
                break
            default:
                console.warn('Invalid theme mode:', theme)
                return
        }

        // Save to localStorage
        try {
            localStorage.setItem('uib-control-theme', theme)
        } catch (error) {
            console.warn('Failed to save theme preference:', error)
        }
    }

    /** Setup drag functionality for moving the control panel
     * @private
     */
    _setupDrag() {
        const toggleButton = this.shadowRoot?.querySelector('.emoji-toggle')
        const container = this.shadowRoot?.querySelector('.control-container')

        if (!toggleButton || !container) return

        let isDragging = false
        let dragStarted = false
        let startX = 0
        let startY = 0
        let initialX = 0
        let initialY = 0
        const dragThreshold = 5 // pixels to move before drag starts

        // Mouse events
        const startDrag = (evt) => {
            const clientX = evt instanceof MouseEvent ? evt.clientX : evt.touches[0].clientX
            const clientY = evt instanceof MouseEvent ? evt.clientY : evt.touches[0].clientY

            startX = clientX
            startY = clientY

            const rect = this.getBoundingClientRect()
            initialX = rect.left
            initialY = rect.top

            isDragging = true
            dragStarted = false

            evt.preventDefault()
        }
        toggleButton.addEventListener('mousedown', startDrag)
        const mouseMove = (evt) => {
            if (!isDragging || !(evt instanceof MouseEvent)) return

            const deltaX = evt.clientX - startX
            const deltaY = evt.clientY - startY

            // Check if we've moved enough to start dragging
            if (!dragStarted && (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold)) {
                dragStarted = true
                container.classList.add('dragging')
                toggleButton.classList.add('dragging')
            }

            if (dragStarted) {
                const newX = initialX + deltaX
                const newY = initialY + deltaY

                // Constrain to viewport
                const maxX = window.innerWidth - this.offsetWidth
                const maxY = window.innerHeight - this.offsetHeight

                const constrainedX = Math.max(0, Math.min(newX, maxX))
                const constrainedY = Math.max(0, Math.min(newY, maxY))

                this.style.left = `${constrainedX}px`
                this.style.top = `${constrainedY}px`
                this.style.right = 'auto'
                this.style.bottom = 'auto'

                evt.preventDefault()
            }
        }
        const mouseUp = (evt) => {
            if (!isDragging) return

            const wasDragStarted = dragStarted
            isDragging = false

            if (dragStarted) {
                dragStarted = false
                container.classList.remove('dragging')
                toggleButton.classList.remove('dragging')

                // Save position if save-position attribute is present
                if (this.hasAttribute('save-position')) {
                    this._savePosition()
                }

                // Dispatch custom event
                this._event('drag-end', {
                    x: parseInt(this.style.left, 10) || 0,
                    y: parseInt(this.style.top, 10) || 0,
                })
            }

            // Only prevent click event if we actually dragged
            if (wasDragStarted) {
                evt.preventDefault()
                evt.stopPropagation()
            }
        }

        // Touch events for mobile
        toggleButton.addEventListener('touchstart', startDrag)
        const touchMove = (evt) => {
            if (!isDragging || !(evt instanceof TouchEvent) || evt.touches.length !== 1) return

            const touch = evt.touches[0]
            const deltaX = touch.clientX - startX
            const deltaY = touch.clientY - startY

            // Check if we've moved enough to start dragging
            if (!dragStarted && (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold)) {
                dragStarted = true
                container.classList.add('dragging')
                toggleButton.classList.add('dragging')
            }

            if (dragStarted) {
                const newX = initialX + deltaX
                const newY = initialY + deltaY

                // Constrain to viewport
                const maxX = window.innerWidth - this.offsetWidth
                const maxY = window.innerHeight - this.offsetHeight

                const constrainedX = Math.max(0, Math.min(newX, maxX))
                const constrainedY = Math.max(0, Math.min(newY, maxY))

                this.style.left = `${constrainedX}px`
                this.style.top = `${constrainedY}px`
                this.style.right = 'auto'
                this.style.bottom = 'auto'

                evt.preventDefault()
            }
        }
        const touchEnd = (evt) => {
            if (!isDragging) return

            const wasDragStarted = dragStarted
            isDragging = false

            if (dragStarted) {
                dragStarted = false
                container.classList.remove('dragging')
                toggleButton.classList.remove('dragging')

                // Save position if save-position attribute is present
                if (this.hasAttribute('save-position')) {
                    this._savePosition()
                }

                // Dispatch custom event
                this._event('drag-end', {
                    x: parseInt(this.style.left, 10) || 0,
                    y: parseInt(this.style.top, 10) || 0,
                })
            }

            // Only prevent click event if we actually dragged
            if (wasDragStarted) {
                evt.preventDefault()
                evt.stopPropagation()
            }
        }

        // Add event listeners and store references for cleanup
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
        document.addEventListener('touchmove', touchMove)
        document.addEventListener('touchend', touchEnd)
        document.addEventListener('touchcancel', touchEnd) // Handle touch cancellation same as touch end

        // Store references for cleanup in disconnectedCallback
        this.#dragHandlers = {
            mouseMove,
            mouseUp,
            touchMove,
            touchEnd,
        }
    }

    /** Save the current position to localStorage
     * @private
     */
    _savePosition() {
        const saveKey = this.getAttribute('save-position') || 'uib-control-position'
        const position = {
            left: this.style.left,
            top: this.style.top,
            timestamp: Date.now(),
        }

        this.#uniqueKey = this.id ? `${this.id}-${saveKey}` : saveKey
        try {
            localStorage.setItem(this.#uniqueKey, JSON.stringify(position))
        } catch (error) {
            console.warn('Failed to save uib-control position:', error)
        }
    }

    /** Restore saved position from localStorage
     * @private
     */
    _restorePosition() {
        if (!this.hasAttribute('save-position')) return

        const saveKey = this.getAttribute('save-position') || 'uib-control-position'

        try {
            const savedData = localStorage.getItem(this.#uniqueKey)
            if (savedData) {
                const position = JSON.parse(savedData)
                if (position.left && position.top) {
                    this.style.left = position.left
                    this.style.top = position.top
                    this.style.right = 'auto'
                    this.style.bottom = 'auto'

                    // Dispatch event to notify position was restored
                    this._event('position-restored', {
                        x: parseInt(position.left, 10) || 0,
                        y: parseInt(position.top, 10) || 0,
                        timestamp: position.timestamp,
                    })
                }
            }
        } catch (error) {
            console.warn('Failed to restore uib-control position:', error)
        }
    }

    /** Function to update the viewport size display
     * @private
     */
    _updateViewportSize() {
        // const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        // const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

        const width = window.innerWidth
        const height = window.innerHeight
        const viewportEl = this.shadowRoot?.getElementById('viewportSize')
        if (viewportEl) {
            viewportEl.textContent = `Window Width: ${width}px, Height: ${height}px`
        }
        const clientEl = this.shadowRoot?.getElementById('clientSize')
        if (clientEl) {
            clientEl.textContent = `Client Width: ${document.documentElement.clientWidth}px, Height: ${document.documentElement.clientHeight}px`
        }
    }

    // #endregion ---- Internal methods ----

    /** Runs when an instance is added to the DOM
     * Runs AFTER the initial attributeChangedCallback's
     * @private
     */
    connectedCallback() {
        this._connect() // Keep at start.

        // Add toggle functionality
        this._setupToggle()

        // Add drag functionality
        this._setupDrag()

        // Restore saved position if save-position attribute is present
        this._restorePosition()

        // Initialize theme from saved preference
        const savedTheme = this._getCurrentTheme()
        if (savedTheme !== 'auto') {
            this._setTheme(savedTheme)
        }

        // Initial call to set the size on page load
        this._updateViewportSize()

        // Store reference to resize handler for cleanup
        this.#resizeHandler = this._updateViewportSize.bind(this)

        // Update the size whenever the window is resized
        window.addEventListener('resize', this.#resizeHandler)

        this._ready() // Keep at end. Let everyone know that a new instance of the component has been connected & is ready
    }

    /** Runs when an instance is removed from the DOM
     * @private
     */
    disconnectedCallback() {
        // Remove toggle event handlers
        if (this.#toggleButton && this.#toggleHandlers) {
            if (this.#toggleHandlers.click) {
                this.#toggleButton.removeEventListener('click', this.#toggleHandlers.click)
            }
            if (this.#toggleHandlers.keydown) {
                this.#toggleButton.removeEventListener('keydown', this.#toggleHandlers.keydown)
            }
            if (this.#toggleHandlers.touchStart) {
                this.#toggleButton.removeEventListener('touchstart', this.#toggleHandlers.touchStart)
            }
            if (this.#toggleHandlers.touchEnd) {
                this.#toggleButton.removeEventListener('touchend', this.#toggleHandlers.touchEnd)
            }
            if (this.#toggleHandlers.themeChange) {
                const themeButtonsContainer = this.shadowRoot?.querySelector('.theme-buttons-container')
                if (themeButtonsContainer) {
                    themeButtonsContainer.removeEventListener('click', this.#toggleHandlers.themeChange)
                }
            }
            if (this.#toggleHandlers.tabClick || this.#toggleHandlers.tabKey) {
                const tabNavigation = this.shadowRoot?.querySelector('.tab-navigation')
                if (tabNavigation) {
                    if (this.#toggleHandlers.tabClick) {
                        tabNavigation.removeEventListener('click', this.#toggleHandlers.tabClick)
                    }
                    if (this.#toggleHandlers.tabKey) {
                        tabNavigation.removeEventListener('keydown', this.#toggleHandlers.tabKey)
                    }
                }
            }
            // Remove outside click handler from document
            if (this.#toggleHandlers.outsideClick) {
                document.removeEventListener('click', this.#toggleHandlers.outsideClick)
            }
        }

        // Remove resize event listener
        if (this.#resizeHandler) {
            window.removeEventListener('resize', this.#resizeHandler)
            this.#resizeHandler = null
        }

        // Remove drag event listeners
        if (this.#dragHandlers.mouseMove) {
            document.removeEventListener('mousemove', this.#dragHandlers.mouseMove)
        }
        if (this.#dragHandlers.mouseUp) {
            document.removeEventListener('mouseup', this.#dragHandlers.mouseUp)
        }
        if (this.#dragHandlers.touchMove) {
            document.removeEventListener('touchmove', this.#dragHandlers.touchMove)
        }
        if (this.#dragHandlers.touchEnd) {
            document.removeEventListener('touchend', this.#dragHandlers.touchEnd)
            document.removeEventListener('touchcancel', this.#dragHandlers.touchEnd) // Also remove touchcancel handler
        }

        // Clear handler references
        this.#dragHandlers = {
            mouseMove: null,
            mouseUp: null,
            touchMove: null,
            touchEnd: null,
        }
        this.#toggleHandlers = {
            click: null,
            keydown: null,
            outsideClick: null,
            touchStart: null,
            touchEnd: null,
            themeChange: null,
            tabClick: null,
            tabKey: null,
        }

        // Clear element references
        this.#toggleButton = null

        this._disconnect() // Keep at end.
    }

    /** Runs when an observed attribute changes - Note: values are always strings
     * NOTE: On initial startup, this is called for each watched attrib set in HTML.
     *       and BEFORE connectedCallback is called.
     * @param {string} attrib Name of watched attribute that has changed
     * @param {string} oldVal The previous attribute value
     * @param {string} newVal The new attribute value
     * @private
     */
    attributeChangedCallback(attrib, oldVal, newVal) {
        /** Optionally ignore attrib changes until instance is fully connected
         * Otherwise this can fire BEFORE everthing is fully connected.
         */
        // if (!this.connected) return

        // Don't bother if the new value same as old
        if ( oldVal === newVal ) return
        // Create a property from the value - WARN: Be careful with name clashes
        this[attrib] = newVal

        // Add other dynamic attribute processing here.
        // If attribute processing doesn't need to be dynamic, process in connectedCallback as that happens earlier in the lifecycle

        // Keep at end. Let everyone know that an attribute has changed for this instance of the component
        this._event('attribChanged', { attribute: attrib, newVal: newVal, oldVal: oldVal, })
    }
} // ---- end of Class ---- //

// Make the class the default export so it can be used elsewhere
export default UibControl

/** Self register the class to global
 * Enables new data lists to be dynamically added via JS
 * and lets the static methods be called
 */
window['UibControl'] = UibControl

// Self-register the HTML tag - Done by uibuilder client library otherwise uibuilder fns can't be used
// customElements.define('uib-control', UibControl)
