# UIBuilder Experimental Module

The `experimental.mjs` module extends the base UIBuilder `Uib` class with experimental features that may be included in future releases. These features are provided for testing and feedback purposes.

## ⚠️ Warning

**Experimental features are subject to change or removal without notice. Use at your own risk in production environments.**

## Features

The experimental module currently provides the following features:

### 1. Reactive Binding

Reactive binding allows automatic synchronization between JavaScript variables and DOM elements.

#### Available Attributes:
- `uib-bind="variableName"` - Binds element's text content to a variable
- `uib-show="variableName"` - Shows/hides element based on variable value
- `uib-text="variableName"` - Sets element's textContent (future)
- `uib-model="variableName"` - Two-way binding for inputs (future)

#### Example:
```html
<input type="text" onchange="uibExperimental.set('userName', this.value)">
<p>Hello, <span uib-bind="userName">World</span>!</p>

<label>
    <input type="checkbox" onchange="uibExperimental.set('showMessage', this.checked)">
    Show message
</label>
<div uib-show="showMessage">This message is conditionally shown!</div>
```

```javascript
// Create custom reactive bindings
uibExperimental.createReactiveBinding('userName', '[uib-bind="userName"]', {
    attribute: 'textContent',
    transformer: (value) => value.toUpperCase(),
    twoWay: false
});
```

### 2. Enhanced Dialogs

Create and manage dialogs with template support and promise-based interaction.

#### Example:
```javascript
// Simple confirmation dialog
const result = await uibExperimental.showExperimentalDialog({
    title: 'Confirm Action',
    template: '<p>Are you sure you want to proceed?</p>',
    modal: true
});

// Custom dialog with template
const result = await uibExperimental.showExperimentalDialog({
    title: 'User Input',
    template: `
        <div>
            <label>Name: <input type="text" id="userName"></label>
            <label>Email: <input type="email" id="userEmail"></label>
        </div>
        <footer>
            <button type="button" value="save">Save</button>
            <button type="button" value="cancel">Cancel</button>
        </footer>
    `,
    modal: true,
    onClose: (result) => {
        console.log('Dialog closed with result:', result);
    }
});
```

### 3. Template Engine

Simple template processing with `{{variable}}` syntax that automatically re-renders when variables change.

#### Auto-Updating Templates

Templates can automatically re-render when any of their variables change:

```javascript
// Set up auto-updating template
const element = document.getElementById('greeting');
element.innerHTML = uibExperimental.processTemplate(
    '<p>Hello {{userName}}! You have {{notifications}} messages.</p>',
    { userName: 'John', notifications: 5 },
    element  // Pass element for auto-update binding
);

// Later, when you change a variable, the template automatically updates
uibExperimental.set('userName', 'Jane');  // Template re-renders automatically
uibExperimental.set('notifications', 10); // Template re-renders automatically
```

#### Manual Template Processing

For one-time template processing without auto-updates:

```javascript
// Simple template processing (no auto-update)
const result = uibExperimental.processTemplate(
    '<p>Hello {{name}}!</p>',
    { name: 'World' }
);

// Or disable auto-updates in applyTemplates
uibExperimental.applyTemplates(data, false); // Second parameter disables auto-update
```

#### Template Attributes

Use `uib-template` attribute for automatic template application:

```html
<template id="greeting-template">
    <h2>{{title}}</h2>
    <p>Hello {{user.name}}, you have {{user.notifications}} notifications.</p>
    <p>Current time: {{currentTime}}</p>
</template>

<div uib-template="#greeting-template"></div>
```

```javascript
// Apply templates with auto-updates (default)
const templateData = {
    title: 'Dashboard',
    user: { name: 'John Doe', notifications: 5 },
    currentTime: new Date().toLocaleTimeString()
};

uibExperimental.applyTemplates(templateData); // Auto-update enabled by default

// Update variables and watch templates automatically re-render
uibExperimental.set('user', { name: 'Jane Smith', notifications: 10 });
```

#### Template Management

```javascript
// Update template data for specific element
uibExperimental.updateTemplateData(element, { 
    userName: 'Jane',
    notifications: 8 
});

// Remove auto-update binding from element
uibExperimental.unbindTemplate(element);
```

### 4. Auto Layout

Automatically apply responsive layouts to container elements.

#### Example:
```javascript
// Apply grid layout
uibExperimental.applyAutoLayout('.grid-container', {
    type: 'grid',
    columns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    responsive: true
});

// Apply flex layout
uibExperimental.applyAutoLayout('.flex-container', {
    type: 'flex',
    wrap: 'wrap',
    gap: '1rem',
    justify: 'space-between',
    breakpoint: 768
});
```

## Installation and Usage

### ES Module Import
```javascript
import uibExperimental from './experimental.mjs';

// Or import both class and instance
import { UibExperimental, uibExperimental } from './experimental.mjs';
```

### Script Tag Usage
```html
<script type="module" src="./experimental.mjs"></script>
<script>
    // Access via global
    window.uibExperimental.showExperimentalDialog({...});
</script>
```

## API Reference

### Constructor
```javascript
const experimental = new UibExperimental();
```

### Methods

#### Reactive Binding
- `createReactiveBinding(variable, selector, config)` - Create custom reactive binding
- `_applyReactiveBinding(config, value)` - Apply binding (internal)
- `_handleReactiveAttributeChange(element, attributeName)` - Handle attribute changes (internal)

#### Dialogs
- `showExperimentalDialog(config)` - Show experimental dialog (returns Promise)
- `closeAllDialogs()` - Close all active dialogs

#### Templates
- `processTemplate(template, data, targetElement)` - Process template string with optional auto-update binding
- `applyTemplates(data, autoUpdate)` - Apply templates to elements with `uib-template` attribute
- `updateTemplateData(element, newData)` - Update template data for specific element
- `unbindTemplate(element)` - Remove auto-update binding from element
- `_extractTemplateVariables(template)` - Extract variable names from template (internal)
- `_setupTemplateAutoUpdate(element, template, data, variables)` - Set up auto-update (internal)
- `_renderTemplate(template, data)` - Core template processing (internal)

#### Layout
- `applyAutoLayout(selector, options)` - Apply automatic layout to containers

#### Utilities
- `getExperimentalMeta()` - Get experimental module metadata
- `hasExperimentalFeature(feature)` - Check if feature is available
- `setExperimentalDebug(enabled)` - Enable/disable debug mode
- `cleanup()` - Clean up experimental features

### Static Properties
- `UibExperimental._experimentalMeta` - Module metadata

## Events

The experimental module dispatches the following custom events:

- `uibuilder:experimentalReady` - Fired when experimental features are initialized
  ```javascript
  document.addEventListener('uibuilder:experimentalReady', (event) => {
      console.log('Experimental features ready:', event.detail);
  });
  ```

## Configuration Types

### ReactiveBindConfig
```javascript
{
    attribute: 'textContent',     // Attribute to bind (optional)
    variable: 'variableName',     // Variable name (optional)
    transformer: (val) => val,    // Transform function (optional)
    twoWay: false,               // Two-way binding (optional)
    selector: '.my-element'       // CSS selector (optional)
}
```

### DialogConfig
```javascript
{
    template: '<p>Content</p>',   // HTML template or selector
    title: 'Dialog Title',       // Dialog title (optional)
    modal: true,                 // Modal dialog (optional, default: true)
    data: {},                    // Template data (optional)
    onClose: (result) => {}      // Close callback (optional)
}
```

## Debug Mode

Enable debug mode to inspect experimental features:

```javascript
uibExperimental.setExperimentalDebug(true);

// Access debug information
console.log(window.uibExpDebug);
// {
//     bindings: Map of reactive bindings,
//     elements: Set of experimental elements,
//     dialogs: Object of active dialogs
// }
```

## Browser Compatibility

The experimental module requires:
- ES6 module support
- MutationObserver API
- ResizeObserver API (for auto-layout)
- HTMLDialogElement (for enhanced dialogs, polyfill recommended for older browsers)

## Relationship to Main UIBuilder

This experimental module extends the main UIBuilder `Uib` class and inherits all its functionality. It can be used alongside the main uibuilder library to test future features.

The experimental features are designed to eventually be merged into the main uibuilder library after sufficient testing and refinement.

## Feedback

Please provide feedback on experimental features through:
- GitHub issues
- Node-RED discourse forum
- UIBuilder documentation feedback

## License

Apache-2.0 - Same as the main UIBuilder project.
