declare module 'uibuilder' {
    export class Uib {
        static _meta: {
            version: string;
            type: string;
            displayName: string;
        };

        connectedNum: number;
        _ioChannels: { control: string; client: string; server: string };
        #pingInterval: Function | undefined;
        #propChangeCallbacks: { [key: string]: Function[] };
        #msgRecvdByTopicCallbacks: { [key: string]: Function[] };
        isVue: boolean;
        vueVersion: string | undefined;
        #timerid: number | null;
        #MsgHandler: any;
        _socket: any;
        _htmlObserver: any;
        #isShowMsg: boolean;
        #isShowStatus: boolean;
        #sendUrlHash: boolean;
        #uniqueElID: number;
        #extCommands: string[];
        #managedVars: { [key: string]: string };
        #showStatus: { [key: string]: { var: string; label: string; description: string } };
        #uiObservers: { [key: string]: any };
        uibAttribs: string[];
        #uibAttrSel: string;

        clientId: string;
        cookies: { [key: string]: string };
        ctrlMsg: object;
        ioConnected: boolean;
        isMinified: boolean;
        isVisible: boolean;
        lastNavType: string;
        maxHttpBufferSize: number;
        msg: object;
        msgsSent: number;
        msgsReceived: number;
        msgsSentCtrl: number;
        msgsCtrlReceived: number;
        online: boolean;
        sentCtrlMsg: object;
        sentMsg: object;
        serverTimeOffset: number | null;
        socketError: string | null;
        tabId: string;
        pageName: string | null;
        purify: boolean;
        markdown: boolean;
        urlHash: string;

        originator: string;
        topic: string | undefined;
        uibrouterinstance: any;
        uibrouter_CurrentRoute: any;

        autoSendReady: boolean;
        httpNodeRoot: string;
        ioNamespace: string;
        ioPath: string;
        retryFactor: number;
        retryMs: number;
        storePrefix: string;
        started: boolean;
        socketOptions: object;

        set logLevel(level: number);
        get logLevel(): number;

        get meta(): object;

        set(prop: string, val: any, store?: boolean, autoload?: boolean): any;
        get(prop: string): any;

        setStore(id: string, value: any, autoload?: boolean): boolean;
        getStore(id: string): any;
        removeStore(id: string): void;
        getManagedVarList(): { [key: string]: string };
        getWatchedVars(): { [key: string]: any };

        onChange(prop: string, callback: Function): number;
        cancelChange(prop: string, cbRef: number): void;
        onTopic(topic: string, callback: Function): number;
        cancelTopic(topic: string, cbRef: number): void;

        _checkTimestamp(receivedMsg: object): void;
        _watchHashChanges(): void;
        arrayIntersect(a1: any[], a2: any[]): any[];
        copyToClipboard(varToCopy: string): void;
        elementExists(cssSelector: string, msg?: boolean): boolean;
        formatNumber(value: number, decimalPlaces?: number, intl?: string, opts?: object): string;
        getObjectSize(obj: any): number | undefined;
        hasUibRouter(): boolean;
        keepHashFromUrl(url: string): string;
        log(): void;
        makeMeAnObject(thing: any, property?: string): object;
        navigate(url: string): Location;
        round(num: number, decimalPlaces: number): number;
        setOriginator(originator?: string): void;
        setPing(ms?: number): void;
        syntaxHighlight(json: object): string;
        truthy(val: any, deflt: any): boolean | any;
        urlJoin(...args: string[]): string;
        watchUrlHash(toggle?: string | number | boolean): boolean;
        elementIsVisible(): boolean;

        $: (cssSelector: string) => HTMLElement | null;
        $$: (cssSelector: string) => HTMLElement[];
        $ui: any;
        addClass: (classNames: string | string[], el: HTMLElement) => void;
        applyTemplate: (source: HTMLElement, target: HTMLElement, onceOnly: boolean) => void;
        buildHtmlTable(data: object[], opts?: object): HTMLTableElement | HTMLParagraphElement;
        createTable(data?: object[], opts?: { parent: string }): void;
        convertMarkdown(mdText: string): string;
        include(url: string, uiOptions: object): Promise<void>;
        loadScriptSrc(url: string): void;
        loadStyleSrc(url: string): void;
        loadScriptTxt(textFn: string): void;
        loadStyleTxt(textFn: string): void;
        loadui(url: string): void;
        removeClass: (classNames: string | string[], el: HTMLElement) => void;
        replaceSlot(el: Element, slot: string): void;
    }

    export const uibuilder: Uib;
    export default uibuilder;
}

declare global {
    const uibuilder: import('uibuilder').Uib;
    const uib: import('uibuilder').Uib;
    const $: (cssSelector: string) => HTMLElement | null;
    const $$: (cssSelector: string) => HTMLElement[];
    const $ui: any;
}
