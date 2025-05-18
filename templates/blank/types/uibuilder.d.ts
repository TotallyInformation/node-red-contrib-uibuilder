/// <reference path="./uibuilder.module.d.ts" />

/**
 * Make the uibuilder instance globally available (from uibuilder.module.d.ts)
 * @version 7.3.0
 */
declare global {
    // Use typeof import to reference the Uib class from the module
    const uibuilder: import("./uibuilder.module").Uib;
}

export {};
