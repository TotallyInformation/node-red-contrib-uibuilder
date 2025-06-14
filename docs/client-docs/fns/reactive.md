---
title: Reactive - A class to create reactive variables
description: |
  The `Reactive` class enables the creation and management of reactive variables.
created: 2025-06-14 16:21:29
updated: 2025-06-14 16:50:22
---

## Potential Limitations

OnChange callback `target` parameter only shows the CURRENT level. Changing a deeply nested property will return the containing object/array and not the full source object. This is a limitation of the current implementation and may be addressed in future updates.

Similarly, deleting a property may result in an "empty item" being returned.

If the target is a JS native object (like `Date`, `Map`, `Set`, etc.), simply assigning to the proxied object will destroy the proxy. You have to use the `value` property to update the value of the proxy.


### 1. **Reactive Class**
```javascript
// Class methods are not directly accessible from the uibuilder reactive() function.
export class Reactive {
    constructor(srcvar, eventDispatcher)
    create()                    // Creates and returns the reactive proxy
    getListenerCount()          // Returns number of active listeners
    clearAllListeners()         // Clears all listeners
    
    // Private methods:
    _isReactive(obj)
    _triggerListeners(propertyPath, value, oldValue, target)
    _createReactiveObject(obj, basePath = '')
}
```

### 2. **Simple use**
```javascript
// From the uibuilder client library:
const data = uibuilder.reactive({ count: 0 })

// Class-based approach:
const ReactiveClass = uibuilder.getReactiveClass()
const reactiveInstance = new ReactiveClass({ count: 0 }, customEventDispatcher)
const proxy = reactiveInstance.create()
```

### 3. **Enhanced Encapsulation**
- All state (listeners, counter, target) is now properly encapsulated in the class
- Methods are clearly separated into public and private
- Better organization with proper class structure

## Benefits of the Class Approach:

### **1. Better State Management**
```javascript
const reactive1 = new Reactive(data1)
const reactive2 = new Reactive(data2)
// Each instance has its own isolated state
console.log(reactive1.getListenerCount()) // Independent listener counts
```

### **2. Enhanced Control**
```javascript
const reactiveInstance = new Reactive(data)
const proxy = reactiveInstance.create()

// Add listeners
const ref1 = proxy.onChange(callback1)
const ref2 = proxy.onChange(callback2)

// Monitor listener count
console.log(reactiveInstance.getListenerCount()) // 2

// Clear all listeners at once
reactiveInstance.clearAllListeners()
console.log(reactiveInstance.getListenerCount()) // 0
```

### **3. Multiple Reactive Objects**
```javascript
// Create multiple reactive instances with different configurations
const userReactive = new Reactive(userData, userEventDispatcher)
const appReactive = new Reactive(appData, appEventDispatcher)

const userProxy = userReactive.create()
const appProxy = appReactive.create()
```

### **4. Advanced Usage**
```javascript
// Direct class usage for advanced scenarios
const ReactiveClass = uibuilder.getReactiveClass()
const customReactive = new ReactiveClass(data, (eventType, details) => {
    // Custom event handling
    console.log(`Custom event: ${eventType}`, details)
})
```

## Key Features:

1. **Full Property Path Tracking**: Provides complete paths like `"user.profile.name"`
2. **Deep Reactivity**: Nested objects automatically become reactive
3. **Event Dispatching**: Custom events are dispatched
4. **Change Listeners**: `onChange` and `cancelChange`

## Usage Examples:

### **Simple Usage**
```javascript
const data = uibuilder.reactive({ count: 0 })
const ref = data.onChange((newVal, oldVal, path) => {
    console.log(`${path}: ${oldVal} → ${newVal}`)
})
```

### **Advanced Class Usage**
```javascript
const ReactiveClass = uibuilder.getReactiveClass()
const instance = new ReactiveClass({ count: 0 })
const proxy = instance.create()

// Monitor and manage listeners
console.log(instance.getListenerCount()) // 0
const ref = proxy.onChange(callback)
console.log(instance.getListenerCount()) // 1
instance.clearAllListeners()
```
