/**
 * Column metadata object definition
 */
export interface ColumnDefinition {
    index: number
    hasName: boolean
    title: string
    name?: string
    key?: string | number
    dataType?: 'string' | 'date' | 'number' | 'html'
    editable?: boolean
}

/**
 * Options for building HTML tables
 */
export interface TableOptions {
    cols?: ColumnDefinition[]
    parent?: HTMLElement | string
    allowHTML?: boolean
}

/**
 * Options for adding a row to a table
 */
export interface TableRowOptions {
    body?: number
    allowHTML?: boolean
    rowId?: string
    afterRow?: number
    beforeRow?: number
    replaceRow?: number
    cols?: ColumnDefinition[]
}

/**
 * Options for adding a table event listener
 */
export interface TableListenerOptions {
    eventScope?: 'row' | 'cell'
    returnType?: 'text' | 'html'
    pad?: number
    send?: boolean
    logLevel?: string | number
    eventType?: string
}

/**
 * Options for applyTemplate
 */
export interface ApplyTemplateConfig {
    onceOnly?: boolean
    attributes?: Record<string, string>
    mode?: 'insert' | 'replace' | 'wrap'
}

/**
 * Options for include
 */
export interface IncludeOptions {
    id: string
    parentSelector?: string
    parent?: string
    type?: string
    slot?: string
    attributes?: Record<string, string>
}

/**
 * UI Component specification
 */
export interface UiComponent {
    type: string
    id?: string
    ns?: string
    parentEl?: HTMLElement
    parent?: string
    position?: 'first' | number
    slot?: string
    slotMarkdown?: string
    attributes?: Record<string, string | string[]>
    events?: Record<string, string>
    properties?: Record<string, any>
    components?: UiComponent[]
}

/**
 * UI Message structure
 */
export interface UiMessage {
    _ui: UiComponent[] | UiComponent
    payload?: any
    topic?: string
}

/**
 * Main Ui class
 */
declare class Ui {
    static version: string
    static win: Window
    static doc: Document
    static log: (...args: any[]) => void
    static mdOpts: any
    static md: any

    sanitiseExtraTags: string[]
    sanitiseExtraAttribs: string[]
    ui_md_plugins: any

    constructor(win: Window, extLog?: (...args: any[]) => void, jsonHighlight?: (json: any) => string)

    _uiAdd(ui: any, isRecurse: boolean): void
    _uiComposeComponent(el: HTMLElement, comp: UiComponent): void
    _uiExtendEl(parentEl: HTMLElement, components: UiComponent[], ns?: string): void
    _uiLoad(ui: any): void
    _uiManager(msg: UiMessage): void
    _uiReload(): void
    _uiRemove(ui: any, all?: boolean): void
    _uiReplace(ui: any): void
    _uiUpdate(ui: any): void

    $(cssSelector: string, output?: 'el' | 'text' | 'html' | 'attributes' | 'attr', context?: HTMLElement): HTMLElement | string | Record<string, string> | null
    $$(cssSelector: string, context?: HTMLElement): HTMLElement[]

    addClass(classNames: string | string[], el: HTMLElement): void
    removeClass(classNames: string | string[] | null | undefined, el: HTMLElement): void

    applyTemplate(sourceId: string, targetId: string, config: ApplyTemplateConfig): void

    convertMarkdown(mdText: string): string

    include(url: string, uiOptions: IncludeOptions): Promise<any>

    loadScriptSrc(url: string): void
    loadScriptTxt(textFn: string): void
    loadStyleSrc(url: string): void
    loadStyleTxt(textFn: string): void
    loadui(url: string): void

    moveElement(opts: { sourceSelector: string, targetSelector: string, moveType?: string, position?: string }): void

    nodeGet(node: HTMLElement, cssSelector: string): Record<string, any>

    notification(config: object | string): Promise<Event>

    replaceSlot(el: Element, slot: string): void
    replaceSlotMarkdown(el: Element, component: UiComponent): void
    sanitiseHTML(html: string): string

    showDialog(type: 'notify' | 'alert', ui: any, msg?: any): void

    ui(json: object): void
    uiGet(cssSelector: string, propName?: string | null): any[]

    uiEnhanceElement(el: HTMLElement, comp: UiComponent): void

    createTable(data: object[] | object, opts?: TableOptions): void
    buildHtmlTable(data: object[] | object, opts?: TableOptions): HTMLTableElement | HTMLParagraphElement | void
    tblAddRow(tbl: string | HTMLTableElement, rowData: object | any[], options?: TableRowOptions): HTMLTableRowElement | void
    tblAddListener(tblSelector: string, options?: TableListenerOptions, out?: object): void
    tblFindColMeta(rowKey: string | number, colMeta?: ColumnDefinition[], tblEl?: HTMLTableElement): ColumnDefinition
    tblGetCellName(cellEl: HTMLTableCellElement, pad?: number): string
    tblGetColMeta(tblEl: HTMLTableElement, options?: { pad?: number }): ColumnDefinition[]
    tblRemoveRow(tbl: string | HTMLTableElement, rowIndex: number, options?: { body?: number }): void
}

export default Ui