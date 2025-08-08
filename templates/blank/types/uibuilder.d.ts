/// <reference path="./uibuilder.module.d.ts" />

/**
 * Make the uibuilder instance globally available (from uibuilder.module.d.ts)
 * Also expose the other global helpers and object aliases from uibuilder
 * @version 7.5.0
 * Add the following to the top of any JS file to enable VS Code intellisense
 * for uibuilder (adjust the path as needed):
 *   /// <reference path="../types/uibuilder.d.ts" />
 */
declare global {
    // Match script-loaded global as a var on window and global scope
    var uibuilder: import("./uibuilder.module").Uib
    var uib: import("./uibuilder.module").Uib
    var $: import("./uibuilder.module").Uib['$']
    var $$: import("./uibuilder.module").Uib['$$']
    var $ui: import("./uibuilder.module").Uib['$ui']

    // Expose helpers mapped from uibuilder instance for script-loaded usage
    // e.g. window['$'] = window['uibuilder'].$
    interface Window {
        uibuilder: import("./uibuilder.module").Uib
        uib?: import("./uibuilder.module").Uib
        $: import("./uibuilder.module").Uib['$']
        $$: import("./uibuilder.module").Uib['$$']
        $ui?: import("./uibuilder.module").Uib['$ui']
        /** Alias of addEventListener for convenience */
        on: Window['addEventListener']
    }
    /** Provide a global Document interface augmentation to match window.on */
    interface Document {
        /** Alias of addEventListener for convenience */
        on: Document['addEventListener']
    }

    /** Add Element.prototype aliases for common DOM helpers */
    interface Element {
        /** Alias of querySelector */
        query: Element['querySelector']
        /** Alias of querySelectorAll */
        queryAll: Element['querySelectorAll']
        /** Alias of addEventListener */
        on: Element['addEventListener']
    }
}

export {};
