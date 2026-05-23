var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/components/json-viewer/json-viewer.mjs
var json_viewer_exports = {};
__export(json_viewer_exports, {
  default: () => json_viewer_default,
  renderToHTML: () => renderToHTML
});
module.exports = __toCommonJS(json_viewer_exports);

// src/components/ti-base-component.mjs
var _HTMLElement = typeof HTMLElement !== "undefined" ? HTMLElement : class {
};
var TiBaseComponent = class _TiBaseComponent extends _HTMLElement {
  /** Component version */
  static baseVersion = "2025-09-20";
  /** Holds a count of how many instances of this component are on the page that don't have their own id
   * Used to ensure a unique id if needing to add one dynamically
   */
  static _iCount = 0;
  /** Is UIBUILDER for Node-RED loaded? */
  uib = !!window["uibuilder"];
  uibuilder = window["uibuilder"];
  /** Mini jQuery-like shadow dom selector (see constructor)
   * @type {function(string): Element}
   * @param {string} selector - A CSS selector to match the element within the shadow DOM.
   * @returns {Element} The first element that matches the specified selector.
   */
  $;
  /** Mini jQuery-like shadow dom multi-selector (see constructor)
   * @type {function(string): NodeList}
   * @param {string} selector - A CSS selector to match the element within the shadow DOM.
   * @returns {NodeList} A STATIC list of all shadow dom elements that match the selector.
   */
  $$;
  /** True when instance finishes connecting.
   * Allows initial calls of attributeChangedCallback to be
   * ignored if needed.
   */
  connected = false;
  /** Placeholder for the optional name attribute @type {string} */
  name;
  /** Runtime configuration settings @type {object} */
  opts = {};
  /** Report the current component version string
   * @returns {string} The component version & base version as a string
   */
  static get version() {
    return `${this.componentVersion} (Base: ${this.baseVersion})`;
  }
  // get id() {
  //     return this.id
  // }
  // set id(value) {
  //     // this.id = value
  //     console.log('>> SETTING ID:', value, this.id, this.getAttribute('id'))
  // }
  /** NB: Attributes not available here - use connectedCallback to reference */
  constructor() {
    super();
  }
  /** OPTIONAL. Update runtime configuration, return complete config
   * @param {object|undefined} config If present, partial or full set of options. If undefined, fn returns the current full option settings
   * @returns {object} The full set of options
   */
  config(config) {
    if (config) this.opts = _TiBaseComponent.deepAssign(this.opts, config);
    return this.opts;
  }
  /** Creates the $ and $$ fns that do css selections against the shadow dom */
  createShadowSelectors() {
    this.$ = this.shadowRoot?.querySelector.bind(this.shadowRoot);
    this.$$ = this.shadowRoot?.querySelectorAll.bind(this.shadowRoot);
  }
  /** Utility object deep merge fn
   * @param {object} target Merge target object
   * @param  {...object} sources 1 or more source objects to merge
   * @returns {object} Deep merged object
   */
  static deepAssign(target, ...sources) {
    for (let source of sources) {
      for (let k in source) {
        const vs = source[k];
        const vt = target[k];
        if (Object(vs) == vs && Object(vt) === vt) {
          target[k] = _TiBaseComponent.deepAssign(vt, vs);
          continue;
        }
        target[k] = source[k];
      }
    }
    return target;
  }
  /** Optionally apply an external linked style sheet for Shadow DOM (called from connectedCallback)
   * param {*} url The URL for the linked style sheet
   */
  async doInheritStyles() {
    if (!this.shadowRoot) return;
    if (!this.hasAttribute("inherit-style")) return;
    let url = this.getAttribute("inherit-style");
    if (!url) url = "./index.css";
    const linkEl = document.createElement("link");
    linkEl.setAttribute("type", "text/css");
    linkEl.setAttribute("rel", "stylesheet");
    linkEl.setAttribute("href", url);
    this.shadowRoot.appendChild(linkEl);
    console.info(`[${this.localName}] Inherit-style requested. Loading: "${url}"`);
  }
  /** Ensure that the component instance has a unique ID & check again if uib loaded */
  ensureId() {
    this.uib = !!window["uibuilder"];
    if (!this.id) {
      this.id = `${this.localName}-${++this.constructor._iCount}`;
    }
  }
  /** Check if slot has meaningful content (not just whitespace)
   * @returns {boolean} True if slot has non-empty content
   */
  hasSlotContent() {
    const slot = this.shadowRoot.querySelector("slot");
    const assignedNodes = slot.assignedNodes();
    return assignedNodes.some((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return true;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent.trim().length > 0;
      }
      return false;
    });
  }
  /** Attaches a new stylesheet before all other stylesheets in the light DOM
   * @param {string} cssText - CSS text to inject directly
   * @param {number} order - Optional order/priority for stylesheet placement. Lower numbers = higher priority (inserted first). Defaults to 0.
   * @returns {Element} The created or existing style element
   * @throws {Error} If cssText is not provided
   * @example
   * // Inject CSS text directly with default order
   * dataList.prependStylesheet('.custom { color: hsl(0, 100%, 50%); }')
   *
   * // Inject CSS with specific order (lower number = higher priority)
   * dataList.prependStylesheet('.base { font-size: 1rem; }', 1)
   * dataList.prependStylesheet('.critical { color: hsl(0, 100%, 50%); }', 0)
   */
  prependStylesheet(cssText, order = 0) {
    if (!cssText) {
      throw new Error(`[${this.localName}] cssText must be provided`);
    }
    const existingStylesheet = this._findExistingStylesheet();
    if (existingStylesheet) return existingStylesheet;
    const styleElement = document.createElement("style");
    styleElement.textContent = cssText;
    styleElement.setAttribute("data-component", this.localName);
    styleElement.setAttribute("data-order", order.toString());
    this._prependToDocumentHead(styleElement, order);
    return styleElement;
  }
  /** Send a message to the Node-RED server via uibuilder if available
   * NB: These web components are NEVER dependent on Node-RED or uibuilder.
   * @param {string} evtName The event name to send
   * @param {*} data The data to send
   */
  uibSend(evtName, data) {
    if (this.uib) {
      if (this.uibuilder.ioConnected) {
        this.uibuilder.send({
          topic: `${this.localName}:${evtName}`,
          payload: data,
          id: this.id,
          name: this.name
        });
      } else {
        console.warn(`[${this.localName}] uibuilder not connected to server, cannot send:`, evtName, data);
      }
    }
  }
  // #region ---- Methods private to extended classes ----
  // These are called from a class that extends this base class but should not be called directly by the user.
  /** Standardised connection. Call from the start of connectedCallback fn */
  _connect() {
    this.ensureId();
    this.doInheritStyles();
    if (this.uib) this.uibuilder.onTopic(`${this.localName}::${this.id}`, this._uibMsgHandler.bind(this));
  }
  /** Standardised constructor. Keep after call to super()
   * @param {Node|string} template Nodes/string content that will be cloned into the shadow dom
   * @param {{mode:'open'|'closed',delegatesFocus:boolean}=} shadowOpts Options passed to attachShadow
   */
  _construct(template, shadowOpts) {
    if (!template) return;
    if (!shadowOpts) shadowOpts = { mode: "open", delegatesFocus: true };
    this.attachShadow(shadowOpts).append(template);
    this.createShadowSelectors();
  }
  /** Standardised disconnection. Call from the END of disconnectedCallback fn */
  _disconnect() {
    document.removeEventListener(`uibuilder:msg:_ui:update:${this.id}`, this._uibMsgHandler);
    this._event("disconnected");
  }
  /** Custom event dispacher `component-name:name` with detail data
   * @example
   *   this._event('ready')
   * @example
   *   this._event('ready', {age: 42, type: 'android'})
   *
   * @param {string} evtName A name to give the event, added to the component-name separated with a :
   * @param {*=} data Optional data object to pass to event listeners via the evt.detail property
   */
  _event(evtName, data) {
    this.dispatchEvent(new CustomEvent(`${this.localName}:${evtName}`, {
      bubbles: true,
      composed: true,
      detail: {
        id: this.id,
        name: this.name,
        data
      }
    }));
  }
  /** Call from end of connectedCallback */
  _ready() {
    this.connected = true;
    this._event("connected");
    this._event("ready");
  }
  /** Handle a `${this.localName}::${this.id}` custom event
   * Each prop in the msg.payload is set as a prop on the component instance.
   * @param {object} msg A uibuilder message object
   */
  _uibMsgHandler(msg) {
    if (typeof msg.payload !== "object") {
      console.warn(`[${this.localName}] Ignoring msg, payload is not an object:`, msg);
      return;
    }
    Object.keys(msg.payload).forEach((key) => {
      if (key.startsWith("_")) return;
      let key2 = key.toLowerCase();
      if (key2.startsWith("data-")) key2 = "data";
      switch (key2) {
        case "value": {
          this.setAttribute("value", msg.payload[key]);
          break;
        }
        case "class": {
          this.className = msg.payload[key];
          break;
        }
        case "style": {
          this.style.cssText = msg.payload[key];
          break;
        }
        case "data": {
          this.dataset[key.replace("data-", "")] = msg.payload[key];
          break;
        }
        default: {
          this[key] = msg.payload[key];
          break;
        }
      }
    });
  }
  // #endregion ---- Methods private to the extended classes ----
  // #region ---- Methods private to the base class only ----
  /** Find existing component stylesheet with the same data-component attribute value
   * Assumes that the style element has a `data-component` attribute set to the component's local name
   * @returns {Element|null} Existing element or null if not found
   * @private
   */
  _findExistingStylesheet() {
    const existing = document.head.querySelector(
      `style[data-component="${this.localName}"]`
    );
    return existing;
  }
  /** Helper method to prepend a style element to the document head with order consideration
   * @param {HTMLElement} styleElement - The style element to prepend
   * @param {number} order - The order/priority for placement (lower numbers = higher priority)
   * @private
   */
  _prependToDocumentHead(styleElement, order) {
    const head = document.head;
    const existingComponentStyles = Array.from(head.querySelectorAll("style[data-component]"));
    if (existingComponentStyles.length === 0) {
      const firstChild = head.firstChild;
      if (firstChild) {
        head.insertBefore(styleElement, firstChild);
      } else {
        head.appendChild(styleElement);
      }
      return;
    }
    let insertBefore = null;
    for (const existing of existingComponentStyles) {
      const existingOrder = parseInt(existing.getAttribute("data-order") ?? "0", 10);
      if (order < existingOrder) {
        insertBefore = existing;
        break;
      }
    }
    if (insertBefore) {
      head.insertBefore(styleElement, insertBefore);
    } else {
      const lastInjected = existingComponentStyles[existingComponentStyles.length - 1];
      const nextSibling = lastInjected.nextSibling;
      if (nextSibling) {
        head.insertBefore(styleElement, nextSibling);
      } else {
        head.appendChild(styleElement);
      }
    }
  }
  // #endregion ---- Methods private to the base class only ----
};
var ti_base_component_default = TiBaseComponent;

// src/components/json-viewer/json-viewer.mjs
var CONFIGMAXCHILDREN = 1e3;
var CONFIGMAXTOTAL = 5e4;
var COMPONENT_VERSION = "2026-05-09";
var STYLES = (
  /* css */
  `
json-viewer {
    display: block;
    font-family: var(--jv-font-family, 'Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', monospace);
    font-size: var(--jv-font-size, 0.875rem);
    line-height: 1.5;
    background: var(--jv-bg, transparent);
    color: var(--jv-color, inherit);
    overflow: auto;
}
.jv-tree-wrap {
    display: flow-root;
}
.jv-controls {
    float: right;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0 0.2rem 0.4rem;
}
.jv-search-row {
    padding: 0.25rem 0.5rem;
    border-bottom: 1px solid hsl(0 0% 50% / 0.2);
}
.jv-search {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 0.2rem 0.4rem;
    border: 1px solid hsl(0 0% 60%);
    border-radius: 3px;
    font-family: inherit;
    font-size: inherit;
    background: var(--jv-bg, transparent);
    color: var(--jv-color, inherit);
}
.jv-btn {
    padding: 0.15rem 0.5rem;
    border: 1px solid hsl(0 0% 60%);
    border-radius: 3px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-size: 0.8em;
    white-space: nowrap;
}
.jv-btn:hover, .jv-btn:focus-visible {
    background: hsl(0 0% 50% / 0.15);
    outline: 2px solid hsl(200 100% 50%);
    outline-offset: 1px;
}
.jv-tree { padding: 0.25rem 0.5rem; }
.jv-node {
    padding-left: var(--jv-indent, 1.25rem);
    outline: none;
}
.jv-node.jv-leaf:focus-visible,
details.jv-node > summary:focus-visible {
    outline: 2px solid hsl(200 100% 50%);
    outline-offset: 1px;
    border-radius: 2px;
}
/* <details>/<summary> expand/collapse \u2014 no JavaScript required */
details.jv-node > summary {
    list-style: none;
    margin-left: calc(-1 * var(--jv-indent, 1.25rem));
    cursor: pointer;
    display: block;
}
details.jv-node > summary::-webkit-details-marker { display: none; }
details.jv-node > summary::marker { content: ''; }
details.jv-node > summary::before {
    content: '\u25BC';
    display: inline-block;
    width: var(--jv-indent, 1.25rem);
    text-align: center;
    font-size: 0.65em;
    color: var(--jv-toggle-color, hsl(0 0% 55%));
    user-select: none;
}
details.jv-node:not([open]) > summary::before { content: '\u25B6'; }
details.jv-node[open] > summary .jv-hint { display: none; }
details.jv-node:not([open]) > summary .jv-hint { display: inline; }
.jv-key { color: var(--jv-key-color, hsl(230 60% 45%)); cursor: pointer; }
.jv-key:hover { text-decoration: underline; }
.jv-key[contenteditable='true'] {
    border-bottom: 1px dashed hsl(0 0% 60%);
    cursor: text;
    outline: none;
    min-width: 2ch;
    text-decoration: none !important;
}
.jv-key[contenteditable='true']:focus { border-bottom-color: hsl(200 100% 50%); }
.jv-sep { color: hsl(0 0% 50%); margin: 0 0.1em; }
.jv-string  { color: var(--jv-string-color,  hsl(10  80% 40%)); }
.jv-val.jv-string::before,
.jv-val.jv-string::after { content: '"'; }
.jv-number  { color: var(--jv-number-color,  hsl(260 70% 50%)); }
.jv-val.jv-bigint { color: var(--jv-number-color, hsl(260 70% 50%)); }
.jv-val.jv-bigint::after { content: 'n'; }
.jv-boolean { color: var(--jv-boolean-color, hsl(200 80% 40%)); font-weight: bold; }
.jv-null,
.jv-undefined { color: var(--jv-null-color, hsl(0 0% 55%)); font-style: italic; }
.jv-special,
.jv-circular { color: var(--jv-special-color, hsl(30 80% 40%)); font-style: italic; }
.jv-regexp  { color: var(--jv-regexp-color, hsl(330 70% 45%)); }
.jv-bracket,
.jv-bracket-close { color: hsl(0 0% 45%); }
.jv-hint { color: hsl(0 0% 60%); font-size: 0.85em; margin-left: 0.3em; }
.jv-copy {
    appearance: none;
    -webkit-appearance: none;
    opacity: 0;
    border: none;
    box-shadow: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.8em;
    padding: 0 0.15rem;
    margin: 0;
    color: hsl(0 0% 60%);
    display: inline-flex;
    align-items: center;
    line-height: 1;
    transition: opacity 0.15s;
    border-radius: 2px;
}
.jv-node:hover > .jv-copy,
.jv-node.jv-leaf:focus-visible > .jv-copy,
details.jv-node:focus-within > .jv-copy { opacity: 1; }
.jv-copy:hover,
.jv-copy:focus-visible { color: hsl(200 100% 40%); opacity: 1; outline: 1px solid hsl(200 100% 50%); }
.jv-add {
    appearance: none;
    -webkit-appearance: none;
    opacity: 0;
    border: none;
    box-shadow: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.85em;
    font-weight: bold;
    padding: 0 0.2rem;
    margin: 0 0.1rem;
    color: hsl(120 50% 40%);
    display: inline-flex;
    align-items: center;
    line-height: 1;
    transition: opacity 0.15s;
    border-radius: 2px;
    vertical-align: middle;
}
details.jv-node:not([open]) > summary .jv-add { display: none !important; }
details.jv-node[open] > summary:hover .jv-add,
details.jv-node[open] > summary:focus-visible .jv-add { opacity: 1; }
.jv-add:hover,
.jv-add:focus-visible { color: hsl(120 70% 30%); opacity: 1; outline: 1px solid hsl(120 70% 50%); }
.jv-delete {
    appearance: none;
    -webkit-appearance: none;
    opacity: 0;
    border: none;
    box-shadow: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.8em;
    padding: 0 0.15rem;
    margin: 0;
    color: hsl(0 60% 55%);
    display: inline-flex;
    align-items: center;
    line-height: 1;
    transition: opacity 0.15s;
    border-radius: 2px;
}
/* Leaf nodes: delete is a direct child of the node div */
.jv-node.jv-leaf:hover > .jv-delete,
.jv-node.jv-leaf:focus-visible > .jv-delete { opacity: 1; }
/* Expandable nodes: delete is inside <summary> */
details.jv-node > summary:hover .jv-delete,
details.jv-node > summary:focus-visible .jv-delete { opacity: 1; }
.jv-delete:hover,
.jv-delete:focus-visible { color: hsl(0 80% 45%); opacity: 1; outline: 1px solid hsl(0 80% 50%); }
.jv-children { padding-left: 0; }
.jv-hl { background: var(--jv-hl-bg, hsl(50 100% 70% / 0.6)); border-radius: 2px; }
.jv-hidden { display: none !important; }
.jv-truncated {
    color: var(--jv-truncated-color, hsl(0 0% 55%));
    font-style: italic;
    font-size: 0.85em;
    cursor: default;
    user-select: none;
}
.jv-val[contenteditable='true'] {
    border-bottom: 1px dashed hsl(0 0% 60%);
    cursor: text;
    outline: none;
    min-width: 2ch;
}
.jv-val[contenteditable='true']:focus { border-bottom-color: hsl(200 100% 50%); }

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .jv-key     { color: var(--jv-key-color,     hsl(220 80% 75%)); }
    .jv-string  { color: var(--jv-string-color,  hsl(30  90% 65%)); }
    .jv-number  { color: var(--jv-number-color,  hsl(270 80% 75%)); }
    .jv-val.jv-bigint { color: var(--jv-number-color, hsl(270 80% 75%)); }
    .jv-boolean { color: var(--jv-boolean-color, hsl(200 80% 70%)); }
    .jv-null,
    .jv-undefined { color: var(--jv-null-color, hsl(0 0% 60%)); }
    .jv-special,
    .jv-circular  { color: var(--jv-special-color, hsl(40 80% 65%)); }
    .jv-regexp    { color: var(--jv-regexp-color, hsl(330 80% 70%)); }
    .jv-truncated { color: var(--jv-truncated-color, hsl(0 0% 60%)); }
    .jv-bracket,
    .jv-bracket-close { color: hsl(0 0% 65%); }
    details.jv-node > summary::before { color: var(--jv-toggle-color, hsl(0 0% 70%)); }
}

/* Print styles: expand everything and hide controls */
@media print {
    .jv-controls { display: none; }
    .jv-search-row { display: none; }
    details.jv-node > :not(summary) { display: block !important; }
    details.jv-node > summary .jv-hint { display: none !important; }
    .jv-copy { display: none; }
    .jv-add { display: none; }
    .jv-delete { display: none; }
}
`
);
function escHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function typeOf(value) {
  if (value === null) return "null";
  if (value === void 0) return "undefined";
  if (typeof value === "string" || value instanceof String) return "string";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "symbol") return "symbol";
  if (typeof value === "bigint") return "bigint";
  if (typeof value === "function") return "function";
  if (Number.isFinite(value)) return "number";
  if (Number.isNaN(value)) return "nan";
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) return "date";
  if (value instanceof RegExp) return "regexp";
  if (value instanceof Promise) return "promise";
  if (value instanceof Error) return "error";
  if (value instanceof Map) return "map";
  if (value instanceof Set) return "set";
  if (value instanceof WeakMap) return "weakmap";
  if (value instanceof WeakSet) return "weakset";
  if (value instanceof ArrayBuffer) return "arraybuffer";
  if (ArrayBuffer.isView(value)) return "typedarray";
  if (value instanceof URL || value instanceof URLSearchParams) return "urllike";
  if (!Number.isFinite(value) && typeof value === "number") return "infinity";
  return typeof value;
}
function renderLeafValue(val, type, editable = false) {
  if (editable && (type === "string" || type === "number" || type === "boolean" || type === "bigint" || type === "null" || type === "undefined")) {
    if (type === "null") return "null";
    if (type === "undefined") return "undefined";
    return escHtml(String(val));
  }
  switch (type) {
    case "string":
      return escHtml(val);
    case "number":
      return escHtml(String(val));
    case "bigint":
      return escHtml(String(val));
    case "boolean":
      return String(val);
    case "null":
      return "null";
    case "undefined":
      return "undefined";
    case "date":
      return escHtml(`[Date: ${val.toISOString()}]`);
    case "nan":
      return `[NaN]`;
    case "regexp":
      return escHtml(String(val));
    case "function": {
      const fnName = val.name || "anonymous";
      const kindMap = { AsyncFunction: "async", GeneratorFunction: "generator", AsyncGeneratorFunction: "async-generator" };
      const fnKind = kindMap[val.constructor.name] ?? "";
      const src = val.toString().trimStart().slice(0, 20);
      const arrow = !src.startsWith("function") && !src.startsWith("async function") ? "arrow " : "";
      const fnType = fnKind || arrow ? `{${`${arrow}${fnKind}`.trim()}}` : "";
      return escHtml(`[f ${fnName} ${fnType} ]`);
    }
    case "error":
      return escHtml(`[${val.name}: ${val.message}]`);
    case "urllike":
      return escHtml(`[URL: ${val.toString()}]`);
    case "symbol": {
      const desc = val.description !== void 0 ? escHtml(val.description) : "";
      return `Symbol(${desc})`;
    }
    case "weakmap":
      return "[WeakMap]";
    case "weakset":
      return "[WeakSet]";
    case "arraybuffer":
      return escHtml(JSON.stringify(Array.from(new Uint8Array(val))));
    case "typedarray":
      return escHtml(JSON.stringify(Array.from(val)));
    default:
      return `[${escHtml(type)}]`;
  }
}
function countLabel(val, type) {
  const n = type === "map" || type === "set" ? val.size : type === "array" ? val.length : Object.keys(val).length;
  const noun = type === "array" || type === "set" ? n === 1 ? "item" : "items" : type === "map" ? n === 1 ? "entry" : "entries" : n === 1 ? "prop" : "props";
  return `${n} ${noun}`;
}
function buildPath(parentPath, key, parentType) {
  if (parentPath === "") return String(key);
  if (parentType === "array") return `${parentPath}[${key}]`;
  if (/[^a-zA-Z0-9_$]/.test(String(key))) {
    return `${parentPath}["${String(key).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`;
  }
  return `${parentPath}.${key}`;
}
function parseInput(input) {
  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch (_) {
    }
  }
  return input;
}
function mapKeyLabel(k) {
  if (k === null) return "null";
  if (k === void 0) return "undefined";
  if (typeof k === "string") return k;
  if (typeof k === "number" || typeof k === "boolean" || typeof k === "bigint") return String(k);
  if (k instanceof RegExp) return String(k);
  return `(${typeOf(k)})`;
}
function renderNode(val, opts) {
  const { maxDepth, collapsed, editable, interactive, key, path, depth, seen, parentType, maxChildren, budget } = opts;
  const type = typeOf(val);
  const isExpandable = type === "object" || type === "array" || type === "map" || type === "set";
  const safeKey = key !== null && key !== void 0 ? String(key) : null;
  const pathAttr = escHtml(path !== "" ? path : "(root)");
  const displayKey = safeKey !== null ? escHtml(safeKey) : null;
  const isObjectKey = key !== null && key !== void 0 && typeof key !== "number" && parentType === "object";
  const keyEditable = editable && interactive && isObjectKey;
  if (budget.remaining <= 0) {
    return `<div class="jv-node jv-leaf jv-truncated" role="treeitem" tabindex="-1" data-jv-path="${pathAttr}" data-jv-type="truncated">\u2026 node limit reached</div>`;
  }
  budget.remaining--;
  const keyHtml = displayKey !== null ? keyEditable ? `<span class="jv-key" contenteditable="true" spellcheck="false" data-jv-key-editable="true" data-jv-path="${pathAttr}" aria-label="Edit key name">${displayKey}</span><span class="jv-sep">:</span> ` : interactive ? `<span class="jv-key" data-jv-copy="path" title="Copy path: ${pathAttr}">${displayKey}</span><span class="jv-sep">:</span> ` : `<span class="jv-key">${displayKey}</span><span class="jv-sep">:</span> ` : "";
  const expandKeyHtml = displayKey !== null ? keyEditable ? `<span class="jv-key" contenteditable="true" spellcheck="false" data-jv-key-editable="true" data-jv-path="${pathAttr}" aria-label="Edit key name">${displayKey}</span><span class="jv-sep">:</span> ` : `<span class="jv-key">${displayKey}</span><span class="jv-sep">:</span> ` : "";
  if (isExpandable) {
    if (seen.has(val)) {
      return `<div class="jv-node jv-leaf jv-circular" role="treeitem" tabindex="0" data-jv-path="${pathAttr}" data-jv-type="${type}">${keyHtml}<span class="jv-circular" title="Circular reference">[Circular \u21BA]</span>` + (interactive ? `<button class="jv-copy" data-jv-copy="path" aria-label="Copy path to clipboard" title="Copy path to clipboard" tabindex="-1">\u2398</button>` : "") + `</div>`;
    }
    seen.add(val);
  }
  if (!isExpandable) {
    const canEdit = editable && (type === "string" || type === "number" || type === "boolean" || type === "bigint" || type === "null" || type === "undefined");
    const valContent = renderLeafValue(val, type, canEdit);
    const editAttrs = canEdit ? ` contenteditable="true" spellcheck="false" data-jv-editable="true" data-jv-type="${type}" aria-label="Edit ${type} value"` : "";
    const valHtml = `<span class="jv-val jv-${type}"${editAttrs}>${valContent}</span>`;
    const copyKind = canEdit ? "value" : "value";
    return `<div class="jv-node jv-leaf jv-${type}" role="treeitem" tabindex="0" data-jv-path="${pathAttr}" data-jv-type="${type}">${keyHtml}${valHtml}` + (interactive ? `<button class="jv-copy" data-jv-copy="value" aria-label="Copy value to clipboard" title="Copy value to clipboard" tabindex="-1">\u2398</button>` : "") + (interactive && editable ? `<button class="jv-delete" aria-label="Delete entry" title="Delete entry" tabindex="-1">\xD7</button>` : "") + `</div>`;
  }
  const isOpen = !collapsed && depth < maxDepth;
  const openAttr = isOpen ? " open" : "";
  const bracketOpen = type === "array" || type === "set" ? "[" : "{";
  const bracketClose = type === "array" || type === "set" ? "]" : "}";
  const typePrefix = type === "map" ? "Map" : type === "set" ? "Set" : "";
  const hint = countLabel(val, type);
  const mapKeyArr = type === "map" ? Array.from(val.keys()) : null;
  const allEntries = type === "array" || type === "set" ? Array.from(val, (v, i) => (
    /** @type {[number, *]} */
    [i, v]
  )) : type === "map" ? Array.from(val.values()).map((v, i) => (
    /** @type {[number, *]} */
    [i, v]
  )) : Object.entries(val);
  const hiddenCount = maxChildren > 0 && allEntries.length > maxChildren ? allEntries.length - maxChildren : 0;
  const entries = hiddenCount > 0 ? allEntries.slice(0, maxChildren) : allEntries;
  let truncationHtml = "";
  if (hiddenCount > 0) {
    const noun = type === "array" || type === "set" ? hiddenCount === 1 ? "item" : "items" : hiddenCount === 1 ? "prop" : "props";
    truncationHtml = `<div class="jv-node jv-leaf jv-truncated" role="treeitem" tabindex="-1">\u2026 ${hiddenCount} more ${noun} not shown (max-children=${maxChildren})</div>`;
  }
  const childrenHtml = entries.map(([k, v]) => {
    const childKey = type === "map" ? mapKeyLabel(mapKeyArr[k]) : k;
    return renderNode(v, {
      ...opts,
      key: childKey,
      path: buildPath(path, k, type === "map" || type === "set" ? "array" : type),
      depth: depth + 1,
      parentType: type
    });
  }).join("") + truncationHtml;
  seen.delete(val);
  return `<details class="jv-node jv-${type}"${openAttr} data-jv-path="${pathAttr}" data-jv-type="${type}"><summary>${expandKeyHtml}<span class="jv-bracket">${typePrefix}${bracketOpen}</span>${interactive && editable && (type === "object" || type === "array") ? `<button class="jv-add" aria-label="Add entry to ${escHtml(type)}" title="Add entry" tabindex="-1">+</button>` : ""}${interactive && editable && depth > 0 ? `<button class="jv-delete" aria-label="Delete entry" title="Delete entry" tabindex="-1">\xD7</button>` : ""}<span class="jv-hint"> ${bracketClose} ${hint}</span></summary><div class="jv-children" role="group">${childrenHtml}</div><span class="jv-bracket-close">${bracketClose}</span>` + (interactive ? `<button class="jv-copy" data-jv-copy="value" aria-label="Copy value as JSON to clipboard" title="Copy value as JSON to clipboard" tabindex="-1">\u2398</button>` : "") + `</details>`;
}
function renderToHTML(data, opts = {}) {
  const maxDepth = typeof opts.maxDepth === "number" ? Math.max(0, opts.maxDepth) : 2;
  const collapsed = !!opts.collapsed;
  const editable = !!opts.editable;
  const interactive = opts.interactive === true;
  const includeStyles = opts.includeStyles !== false;
  const maxChildren = typeof opts.maxChildren === "number" ? Math.max(0, opts.maxChildren) : CONFIGMAXCHILDREN;
  const budget = { remaining: maxChildren > 0 ? maxChildren * 500 : CONFIGMAXTOTAL };
  const value = parseInput(data);
  const searchHtml = interactive ? `<div class="jv-search-row jv-hidden" role="search"><input type="search" class="jv-search" placeholder="Search keys or values\u2026" aria-label="Search JSON keys and values"></div>` : "";
  const controlsHtml = interactive ? `<div class="jv-controls" role="toolbar" aria-label="JSON viewer controls"><button class="jv-btn jv-collapse-all" aria-label="Collapse all nodes" title="Collapse all">\u229F</button><button class="jv-btn jv-expand-all"   aria-label="Expand all nodes"   title="Expand all">\u229E</button><button class="jv-btn jv-search-toggle" aria-label="Toggle search" title="Search" aria-expanded="false">\u{1F50D}</button></div>` : "";
  const treeHtml = renderNode(value, {
    maxDepth,
    collapsed,
    editable,
    interactive,
    key: null,
    path: "",
    depth: 0,
    seen: /* @__PURE__ */ new WeakSet(),
    parentType: null,
    maxChildren,
    budget
  });
  const styleTag = includeStyles ? `<style>${STYLES}</style>` : "";
  return `${styleTag}${searchHtml}<div class="jv-tree-wrap">${controlsHtml}<div class="jv-tree" role="tree" aria-label="JSON data tree">${treeHtml}</div></div>`;
}
var JsonViewer = class extends ti_base_component_default {
  /** Component version */
  static componentVersion = COMPONENT_VERSION;
  /** Static re-export of the pure renderer, accessible as JsonViewer.renderToHTML
   * @type {typeof renderToHTML}
   */
  static renderToHTML = renderToHTML;
  /** Watched HTML attributes
   * @returns {string[]} Attribute names that trigger attributeChangedCallback
   */
  static get observedAttributes() {
    return ["data", "max-depth", "max-children", "collapsed", "filter-type", "editable", "name"];
  }
  // #region ── Private fields ────────────────────────────────────────────
  /** Current parsed data value @type {*} */
  #data = void 0;
  /** Maximum auto-expand depth @type {number} */
  #maxDepth = 2;
  /** Whether all expandable nodes are initially collapsed @type {boolean} */
  #collapsed = false;
  /** Active data-type filter (null = show all) @type {string|null} */
  #filterType = null;
  /** Whether scalar leaf values are editable @type {boolean} */
  #editable = false;
  /** Maximum number of children to render per expandable node (0 = unlimited) @type {number} */
  #maxChildren = CONFIGMAXCHILDREN;
  /** Current search query @type {string} */
  #searchQuery = "";
  /** AbortController used to clean up event listeners on disconnect @type {AbortController|null} */
  #abortController = null;
  // #endregion
  // #region ── Constructor ───────────────────────────────────────────────
  constructor() {
    super();
  }
  // #endregion
  // #region ── Getters / Setters ─────────────────────────────────────────
  /** Get the current rendered data
   * @returns {*} Current data value
   */
  get data() {
    return this.#data;
  }
  /** Set new data and re-render the tree
   * @param {*} val - New data value (JS object, array, primitive, or JSON string)
   */
  set data(val) {
    this.#data = parseInput(val);
    this.#searchQuery = "";
    if (this.connected) this._render();
  }
  /** Get the current max-depth setting @returns {number} */
  get maxDepth() {
    return this.#maxDepth;
  }
  /** Set max-depth and re-render
   * @param {number|string} val - New depth value
   */
  set maxDepth(val) {
    const n = parseInt(val, 10);
    this.#maxDepth = isNaN(n) ? 2 : Math.max(0, n);
    if (this.connected) this._render();
  }
  /** Get collapsed state @returns {boolean} */
  get collapsed() {
    return this.#collapsed;
  }
  /** Set collapsed state and re-render @param {boolean|string} val */
  set collapsed(val) {
    this.#collapsed = val === true || val === "" || val === "true" || val === "collapsed";
    if (this.connected) this._render();
  }
  /** Get the active type filter @returns {string|null} */
  get filterType() {
    return this.#filterType;
  }
  /** Set the type filter and apply it @param {string|null} val */
  set filterType(val) {
    this.#filterType = val && val !== "all" ? val : null;
    if (this.connected) this._applyTypeFilter();
  }
  /** Get editable state @returns {boolean} */
  get editable() {
    return this.#editable;
  }
  /** Set editable state and re-render @param {boolean|string} val */
  set editable(val) {
    this.#editable = val === true || val === "" || val === "true" || val === "editable";
    if (this.connected) this._render();
  }
  /** Get max-children setting @returns {number} */
  get maxChildren() {
    return this.#maxChildren;
  }
  /** Set max-children and re-render
   * @param {number|string} val - Max children per container (0 = unlimited)
   */
  set maxChildren(val) {
    const n = parseInt(val, 10);
    this.#maxChildren = isNaN(n) ? CONFIGMAXCHILDREN : Math.max(0, n);
    if (this.connected) this._render();
  }
  // #endregion
  // #region ── Lifecycle callbacks ───────────────────────────────────────
  /** Called when the element is added to the document */
  connectedCallback() {
    this._connect();
    this.prependStylesheet(STYLES);
    if (this.hasAttribute("data")) this.#data = parseInput(this.getAttribute("data"));
    if (this.hasAttribute("max-depth")) this.maxDepth = this.getAttribute("max-depth");
    if (this.hasAttribute("collapsed")) this.#collapsed = true;
    if (this.hasAttribute("filter-type")) this.#filterType = this.getAttribute("filter-type") || null;
    if (this.hasAttribute("editable")) this.#editable = true;
    if (this.hasAttribute("max-children")) this.maxChildren = this.getAttribute("max-children");
    this._render();
    this.#abortController = new AbortController();
    const { signal } = this.#abortController;
    this.addEventListener("click", this._onClickCapture.bind(this), { signal, capture: true });
    this.addEventListener("click", this._onClick.bind(this), { signal });
    this.addEventListener("keydown", this._onKeydown.bind(this), { signal });
    this.addEventListener("input", this._onSearchInput.bind(this), { signal });
    this.addEventListener("focusout", this._onValueCommit.bind(this), { signal });
    this.addEventListener("toggle", this._onToggle.bind(this), { signal, capture: true });
    this._ready();
  }
  /** Called when the element is removed from the document */
  disconnectedCallback() {
    this.#abortController?.abort();
    this.#abortController = null;
    this._disconnect();
  }
  /** Called whenever a watched attribute changes
   * @param {string}      attrib - Attribute name
   * @param {string|null} oldVal - Previous attribute value
   * @param {string|null} newVal - New attribute value
   */
  attributeChangedCallback(attrib, oldVal, newVal) {
    if (oldVal === newVal) return;
    switch (attrib) {
      case "data":
        this.#data = parseInput(newVal);
        this.#searchQuery = "";
        if (this.connected) this._render();
        break;
      case "max-depth":
        this.maxDepth = newVal;
        break;
      case "collapsed":
        this.#collapsed = newVal !== null;
        if (this.connected) this._render();
        break;
      case "filter-type":
        this.#filterType = newVal && newVal !== "all" ? newVal : null;
        if (this.connected) this._applyTypeFilter();
        break;
      case "editable":
        this.#editable = newVal !== null;
        if (this.connected) this._render();
        break;
      case "max-children":
        this.maxChildren = newVal;
        break;
      default:
        break;
    }
    this._event("attribChanged", { attribute: attrib, newVal, oldVal });
  }
  // #endregion
  // #region ── Public API ────────────────────────────────────────────────
  /** Collapse all expandable nodes in the tree */
  collapseAll() {
    this.querySelectorAll("details.jv-node").forEach((node) => node.removeAttribute("open"));
    this._event("toggle", { path: "*", expanded: false });
  }
  /** Expand all expandable nodes in the tree */
  expandAll() {
    this.querySelectorAll("details.jv-node").forEach((node) => node.setAttribute("open", ""));
    this._event("toggle", { path: "*", expanded: true });
  }
  /** Apply a search query programmatically (mirrors typing in the search box).
   * Opens the search row when a non-empty query is supplied; closes it when cleared.
   * @param {string} query - Search string (empty string clears the filter and closes the row)
   */
  search(query) {
    const trimmed = query.trim();
    this.#searchQuery = trimmed;
    const row = (
      /** @type {HTMLElement|null} */
      this.querySelector(".jv-search-row")
    );
    const btn = (
      /** @type {HTMLElement|null} */
      this.querySelector(".jv-search-toggle")
    );
    const input = (
      /** @type {HTMLInputElement|null} */
      this.querySelector(".jv-search")
    );
    if (input) input.value = trimmed;
    if (trimmed) {
      if (row) row.classList.remove("jv-hidden");
      if (btn) btn.setAttribute("aria-expanded", "true");
    } else {
      if (row) row.classList.add("jv-hidden");
      if (btn) btn.setAttribute("aria-expanded", "false");
    }
    this._applySearch(trimmed);
  }
  // #endregion
  // #region ── Private render / filter methods ───────────────────────────
  /** Re-render the entire component content from scratch */
  _render() {
    this.innerHTML = renderToHTML(this.#data, {
      maxDepth: this.#maxDepth,
      collapsed: this.#collapsed,
      editable: this.#editable,
      interactive: true,
      maxChildren: this.#maxChildren
    });
    if (this.#searchQuery) {
      const row = (
        /** @type {HTMLElement|null} */
        this.querySelector(".jv-search-row")
      );
      const btn = (
        /** @type {HTMLElement|null} */
        this.querySelector(".jv-search-toggle")
      );
      const input = (
        /** @type {HTMLInputElement|null} */
        this.querySelector(".jv-search")
      );
      if (row) row.classList.remove("jv-hidden");
      if (btn) btn.setAttribute("aria-expanded", "true");
      if (input) input.value = this.#searchQuery;
      this._applySearch(this.#searchQuery);
    }
    if (this.#filterType) this._applyTypeFilter();
  }
  /**
   * Show only nodes whose key or value text matches the query.
   * Ancestor nodes of matching leaves are also revealed so the tree context is clear.
   * Passing an empty string resets all visibility.
   * @param {string} query - Search string
   */
  _applySearch(query) {
    const tree = this.querySelector(".jv-tree");
    if (!tree) return;
    const all = (
      /** @type {NodeListOf<HTMLElement>} */
      tree.querySelectorAll(".jv-node")
    );
    if (!query) {
      all.forEach((n) => n.classList.remove("jv-hidden"));
      return;
    }
    const lq = query.toLowerCase();
    all.forEach((n) => n.classList.add("jv-hidden"));
    all.forEach((node) => {
      const keyEl = node.querySelector(":scope > .jv-key") ?? node.querySelector(":scope > summary > .jv-key");
      const valEl = node.querySelector(":scope > .jv-val") ?? node.querySelector(":scope > summary > .jv-val");
      const keyText = (keyEl?.textContent ?? "").toLowerCase();
      const valText = (valEl?.textContent ?? "").toLowerCase();
      if (keyText.includes(lq) || valText.includes(lq)) {
        node.classList.remove("jv-hidden");
        let parent = node.parentElement?.closest(".jv-node");
        while (parent) {
          parent.classList.remove("jv-hidden");
          if (parent.tagName?.toLowerCase() === "details") parent.setAttribute("open", "");
          parent = parent.parentElement?.closest(".jv-node");
        }
      }
    });
    const matches = this.querySelectorAll(".jv-node.jv-leaf:not(.jv-hidden)").length;
    this._event("search", { query, matches });
  }
  /**
   * Show only nodes whose `data-jv-type` matches `this.#filterType`.
   * Ancestor nodes of matching leaves are also revealed.
   * Clears filter if `this.#filterType` is null.
   */
  _applyTypeFilter() {
    const tree = this.querySelector(".jv-tree");
    if (!tree) return;
    const all = (
      /** @type {NodeListOf<HTMLElement>} */
      tree.querySelectorAll(".jv-node")
    );
    if (!this.#filterType) {
      all.forEach((n) => n.classList.remove("jv-hidden"));
      return;
    }
    const ft = this.#filterType;
    all.forEach((n) => n.classList.add("jv-hidden"));
    all.forEach((node) => {
      if (node.dataset.jvType === ft) {
        node.classList.remove("jv-hidden");
        let parent = node.parentElement?.closest(".jv-node");
        while (parent) {
          parent.classList.remove("jv-hidden");
          if (parent.tagName?.toLowerCase() === "details") parent.setAttribute("open", "");
          parent = parent.parentElement?.closest(".jv-node");
        }
      }
    });
  }
  // #endregion
  // #region ── Private event handlers ────────────────────────────────────
  /** Capture-phase click handler: intercepts jv-add and jv-delete button clicks before
   * the event reaches a parent `<summary>`, which would otherwise toggle the `<details>`.
   * Using capture ensures we fire before the browser's native activation behaviour.
   * @param {MouseEvent} evt Mouse click event (capture phase)
   */
  _onClickCapture(evt) {
    const target = (
      /** @type {HTMLElement} */
      evt.target
    );
    if (!target.classList.contains("jv-add") && !target.classList.contains("jv-delete")) return;
    evt.stopPropagation();
    evt.preventDefault();
    const node = (
      /** @type {HTMLElement|null} */
      target.closest(".jv-node")
    );
    if (!node) return;
    if (target.classList.contains("jv-add")) this._handleAdd(node);
    else this._handleDelete(node);
  }
  /** Delegated click handler
   * @param {MouseEvent} evt Mouse click event
   */
  _onClick(evt) {
    const target = (
      /** @type {HTMLElement} */
      evt.target
    );
    if (target.classList.contains("jv-copy")) {
      evt.preventDefault();
      evt.stopPropagation();
      this._handleCopy(target);
      return;
    }
    if (target.classList.contains("jv-key") && target.dataset.jvCopy === "path") {
      evt.preventDefault();
      const node = target.closest(".jv-node");
      if (node) this._copyPath(node);
      return;
    }
    if (target.classList.contains("jv-collapse-all")) {
      this.collapseAll();
      return;
    }
    if (target.classList.contains("jv-expand-all")) {
      this.expandAll();
      return;
    }
    if (target.classList.contains("jv-search-toggle")) {
      const row = (
        /** @type {HTMLElement|null} */
        this.querySelector(".jv-search-row")
      );
      const isOpen = row && !row.classList.contains("jv-hidden");
      if (isOpen) {
        const input = (
          /** @type {HTMLInputElement|null} */
          this.querySelector(".jv-search")
        );
        if (input) input.value = "";
        this.#searchQuery = "";
        this._applySearch("");
        if (row) row.classList.add("jv-hidden");
        target.setAttribute("aria-expanded", "false");
      } else {
        if (row) row.classList.remove("jv-hidden");
        target.setAttribute("aria-expanded", "true");
        const input = (
          /** @type {HTMLInputElement|null} */
          this.querySelector(".jv-search")
        );
        if (input) {
          input.focus();
          input.select();
        }
      }
      return;
    }
  }
  /** Delegated keyboard handler implementing the ARIA tree keyboard pattern.
   * Acts when focus is on a `.jv-node` leaf or a `<summary>` inside a `<details.jv-node>`.
   * Enter/Space on expandable nodes are handled natively by `<details>/<summary>`.
   * @param {KeyboardEvent} evt Keyboard event
   */
  _onKeydown(evt) {
    const target = (
      /** @type {HTMLElement} */
      evt.target
    );
    if (target.dataset?.jvKeyEditable || target.dataset?.jvEditable || target.closest("[contenteditable]")) {
      if (evt.key === "Enter") {
        evt.preventDefault();
        const editable = (
          /** @type {HTMLElement} */
          target
        );
        editable.blur();
      } else if (evt.key === "Tab" && target.dataset?.jvKeyEditable) {
        evt.preventDefault();
        const keyEl = (
          /** @type {HTMLElement} */
          target
        );
        this._onKeyCommit(keyEl);
        const path = keyEl.dataset.jvPath ?? "";
        const split = this._splitLastSegment(path);
        const newKey = keyEl.textContent?.trim() ?? (split ? String(split.key) : "");
        const parentPath = split?.parentPath ?? "";
        const newPath = parentPath ? `${parentPath}.${newKey}` : newKey;
        const valEl = (
          /** @type {HTMLElement|null} */
          this.querySelector(`[data-jv-path="${newPath}"] > .jv-val[contenteditable]`) ?? this.querySelector(`[data-jv-path="${newPath}"] > .jv-val`)
        );
        if (valEl) valEl.focus();
      }
      return;
    }
    const nodeEl = target.classList.contains("jv-node") ? target : (
      /** @type {HTMLElement|null} */
      target.closest(".jv-node")
    );
    if (!nodeEl) return;
    const tree = this.querySelector(".jv-tree");
    if (!tree) return;
    const allNodes = Array.from(
      /** @type {NodeListOf<HTMLElement>} */
      tree.querySelectorAll(".jv-node:not(.jv-hidden)")
    );
    const reachable = allNodes.filter((n) => {
      let el = n.parentElement;
      while (el && el !== tree) {
        if (el.tagName?.toLowerCase() === "details" && !el.hasAttribute("open") && el.classList.contains("jv-node")) return false;
        el = el.parentElement;
      }
      return true;
    });
    const idx = reachable.indexOf(nodeEl);
    const focusNode = (n) => {
      if (!n) return;
      if (n.tagName?.toLowerCase() === "details") n.querySelector(":scope > summary")?.focus();
      else n.focus();
    };
    const isExpandable = nodeEl.tagName?.toLowerCase() === "details";
    const isOpen = isExpandable && nodeEl.hasAttribute("open");
    switch (evt.key) {
      case "ArrowDown": {
        evt.preventDefault();
        if (idx < reachable.length - 1) focusNode(reachable[idx + 1]);
        break;
      }
      case "ArrowUp": {
        evt.preventDefault();
        if (idx > 0) focusNode(reachable[idx - 1]);
        break;
      }
      case "ArrowRight": {
        evt.preventDefault();
        if (isExpandable && !isOpen) {
          nodeEl.setAttribute("open", "");
        } else if (isExpandable && isOpen) {
          const firstChild = (
            /** @type {HTMLElement|null} */
            nodeEl.querySelector(".jv-children > .jv-node")
          );
          focusNode(firstChild);
        }
        break;
      }
      case "ArrowLeft": {
        evt.preventDefault();
        if (isExpandable && isOpen) {
          nodeEl.removeAttribute("open");
        } else {
          const parent = (
            /** @type {HTMLElement|null} */
            nodeEl.parentElement?.closest(".jv-node")
          );
          focusNode(parent);
        }
        break;
      }
      case "Home": {
        evt.preventDefault();
        if (reachable.length > 0) focusNode(reachable[0]);
        break;
      }
      case "End": {
        evt.preventDefault();
        if (reachable.length > 0) focusNode(reachable[reachable.length - 1]);
        break;
      }
      case "c": {
        if (evt.ctrlKey || evt.metaKey) {
          evt.preventDefault();
          if (evt.shiftKey) this._copyValue(nodeEl);
          else this._copyPath(nodeEl);
        }
        break;
      }
      default:
        break;
    }
  }
  /** Handle native toggle events fired by <details> expandable nodes.
   * Fires whenever a node is expanded or collapsed (by user or programmatic change).
   * @param {Event} evt Toggle event
   */
  _onToggle(evt) {
    const target = (
      /** @type {HTMLElement} */
      evt.target
    );
    if (!target?.classList?.contains("jv-node")) return;
    const expanded = target.hasAttribute("open");
    const path = target.dataset?.jvPath ?? "";
    this._event("toggle", { path, expanded });
  }
  /** Handle input events from the search box
   * @param {Event} evt Input event
   */
  _onSearchInput(evt) {
    const target = (
      /** @type {HTMLInputElement} */
      evt.target
    );
    if (!target.classList.contains("jv-search")) return;
    this.#searchQuery = target.value.trim();
    this._applySearch(this.#searchQuery);
  }
  /** Commit an edit when a contenteditable value loses focus
   * @param {FocusEvent} evt Focus event
   */
  _onValueCommit(evt) {
    const target = (
      /** @type {HTMLElement} */
      evt.target
    );
    if (target.dataset?.jvKeyEditable) {
      this._onKeyCommit(target);
      return;
    }
    if (!target.dataset?.jvEditable) return;
    const node = target.closest(".jv-node");
    if (!node) return;
    const path = (
      /** @type {HTMLElement} */
      node.dataset.jvPath ?? ""
    );
    const type = target.dataset.jvType ?? "string";
    const newText = target.textContent?.trim() ?? "";
    const oldValue = this._getValueAtPath(path);
    let newValue;
    {
      const t = newText.trim();
      if (t.length > 1 && (t[0] === "{" && t[t.length - 1] === "}" || t[0] === "[" && t[t.length - 1] === "]")) {
        try {
          const parsed = JSON.parse(t);
          if (typeof parsed === "object" && parsed !== null) newValue = parsed;
        } catch (_) {
        }
      }
    }
    if (newValue === void 0) {
      if (newText === "null") newValue = null;
      else if (newText === "undefined") newValue = void 0;
      else if (newText === "true") newValue = true;
      else if (newText === "false") newValue = false;
      else if (newText === "NaN") newValue = NaN;
      else if (newText.length >= 2 && newText[0] === '"' && newText[newText.length - 1] === '"') {
        newValue = newText.slice(1, -1);
      } else if (/^-?\d+n$/.test(newText)) {
        try {
          newValue = BigInt(newText.slice(0, -1));
        } catch (_) {
          newValue = newText;
        }
      } else if (newText !== "" && !isNaN(Number(newText))) {
        newValue = Number(newText);
      } else {
        newValue = newText;
      }
    }
    if (Object.is(newValue, oldValue)) return;
    this._event("change", { path, oldValue, newValue, changeType: "valueEdited" });
    if (this.uib) {
      const sendValue = typeof newValue === "bigint" ? `${String(newValue)}n` : newValue;
      const sendOldValue = typeof oldValue === "bigint" ? `${String(oldValue)}n` : oldValue;
      this.uibSend("change", { path, oldValue: sendOldValue, newValue: sendValue, changeType: "valueEdited" });
    }
    this._setValueAtPath(path, newValue);
    this._render();
  }
  // #endregion
  // #region ── Private DOM helpers ───────────────────────────────────────
  /** Toggle the expanded/collapsed state of an expandable <details> node.
   * Called programmatically (e.g. from keyboard handler).
   * The native <details> 'toggle' event fires automatically and calls _onToggle.
   * @param {Element|null} node - The `<details.jv-node>` element to toggle
   */
  _toggleNode(node) {
    if (node?.tagName?.toLowerCase() !== "details") return;
    if (
      /** @type {HTMLElement} */
      node.hasAttribute("open")
    ) {
      node.removeAttribute("open");
    } else {
      node.setAttribute("open", "");
    }
  }
  /** Copy the dot-notation path of a node to the clipboard
   * @param {Element} node - The `.jv-node` element
   */
  _copyPath(node) {
    const path = (
      /** @type {HTMLElement} */
      node.dataset.jvPath ?? ""
    );
    this._writeClipboard(path, "path", path);
  }
  /** Traverse this.#data using a dot/bracket-notation path string to retrieve a sub-value.
   * @param {string} path - Path as produced by buildPath (e.g. "a.b[2].c" or "(root)")
   * @returns {*} The value at that path, or undefined if the path cannot be resolved
   */
  _getValueAtPath(path) {
    if (!path || path === "(root)") return this.#data;
    const normalised = path.replace(/\[(\d+)\]/g, ".$1").replace(/\[["'](.+?)["']\]/g, ".$1");
    const parts = normalised.split(".").filter(Boolean);
    let current = this.#data;
    for (const part of parts) {
      if (current == null || typeof current !== "object") return void 0;
      if (current instanceof Map) {
        current = Array.from(current.values())[parseInt(part, 10)];
      } else if (current instanceof Set) {
        current = Array.from(current)[parseInt(part, 10)];
      } else {
        current = current[part];
      }
    }
    return current;
  }
  /** Write a value into this.#data at the given dot/bracket-notation path.
   * Handles plain objects, arrays, Maps, and Sets.
   * @param {string} path     - Path as produced by buildPath (e.g. "a.b[2].c" or "(root)")
   * @param {*}      newValue - Value to store at the path
   */
  _setValueAtPath(path, newValue) {
    if (!path || path === "(root)") {
      this.#data = newValue;
      return;
    }
    const split = this._splitLastSegment(path);
    if (!split) {
      this.#data = newValue;
      return;
    }
    const parent = this._getValueAtPath(split.parentPath || "");
    if (parent == null || typeof parent !== "object") return;
    if (parent instanceof Map) {
      const mapKey = Array.from(parent.keys())[parseInt(String(split.key), 10)];
      if (mapKey !== void 0) parent.set(mapKey, newValue);
    } else if (parent instanceof Set) {
      const arr = Array.from(parent);
      arr[parseInt(String(split.key), 10)] = newValue;
      parent.clear();
      arr.forEach((v) => parent.add(v));
    } else {
      parent[split.key] = newValue;
    }
  }
  /** Commit a key rename when a contenteditable key span loses focus.
   * Restores the original key text if the new name is empty or unchanged.
   * @param {HTMLElement} target - The `.jv-key[data-jv-key-editable]` span
   */
  _onKeyCommit(target) {
    const path = target.dataset.jvPath ?? "";
    const newKey = target.textContent?.trim() ?? "";
    const split = this._splitLastSegment(path);
    const oldKey = split ? String(split.key) : "";
    if (!newKey || newKey === oldKey) {
      target.textContent = oldKey;
      return;
    }
    if (split) this._renameKey(split.parentPath, oldKey, newKey);
  }
  /** Rename an object property key, preserving insertion order.
   * Mutates the parent object in place, re-renders, and fires `json-viewer:rename`.
   * Silently ignores the rename if `newKey` already exists in the parent.
   * @param {string} parentPath - Path to the parent object (empty string = root)
   * @param {string} oldKey     - Current property key
   * @param {string} newKey     - Desired new property key
   */
  _renameKey(parentPath, oldKey, newKey) {
    const parent = this._getValueAtPath(parentPath);
    if (parent === null || parent === void 0 || typeof parent !== "object" || Array.isArray(parent)) return;
    if (Object.prototype.hasOwnProperty.call(parent, newKey)) return;
    const entries = Object.entries(parent);
    for (const k of Object.keys(parent)) delete parent[k];
    for (const [k, v] of entries) parent[k === oldKey ? newKey : k] = v;
    this._render();
    this._event("rename", { parentPath, oldKey, newKey });
    if (this.uib) this.uibSend("rename", { parentPath, oldKey, newKey });
  }
  /** Handle add-entry button click for an expandable node.
   * Appends `null` to arrays; adds a unique `"new_key"` property to objects.
   * Mutates `this.#data` directly, re-renders, then fires `json-viewer:add`.
   * @param {HTMLElement} node - The expandable `.jv-node` element
   */
  _handleAdd(node) {
    const pathAttr = node.dataset.jvPath ?? "";
    const type = node.dataset.jvType ?? "object";
    const container = this._getValueAtPath(pathAttr);
    if (type === "array" && Array.isArray(container)) {
      container.push(null);
      const newPath = pathAttr === "(root)" || pathAttr === "" ? String(container.length - 1) : `${pathAttr}[${container.length - 1}]`;
      const containerOldValue = container.slice(0, -1);
      this._render();
      this._event("add", { path: pathAttr, type, newValue: null, newPath });
      this._event("change", { path: pathAttr, oldValue: containerOldValue, newValue: [...container], changeType: "addedProperty" });
      if (this.uib) this.uibSend("add", { path: pathAttr, type, newValue: null, newPath, changeType: "addedProperty" });
    } else if (type === "object" && container !== null && typeof container === "object" && !Array.isArray(container)) {
      let key = "new_key";
      let i = 1;
      while (Object.prototype.hasOwnProperty.call(container, key)) key = `new_key_${i++}`;
      container[key] = null;
      const containerSnapshot = { ...container };
      delete containerSnapshot[key];
      this._render();
      this._event("add", { path: pathAttr, type, newKey: key, newValue: null });
      this._event("change", { path: pathAttr, oldValue: containerSnapshot, newValue: { ...container }, changeType: "addedProperty" });
      if (this.uib) this.uibSend("add", { path: pathAttr, type, newKey: key, newValue: null, changeType: "addedProperty" });
      const containerPath = pathAttr === "(root)" ? "" : pathAttr;
      const childPath = buildPath(containerPath, key, "object");
      const newKeyEl = (
        /** @type {HTMLElement|null} */
        this.querySelector(`[data-jv-key-editable][data-jv-path="${childPath}"]`)
      );
      if (newKeyEl) {
        newKeyEl.focus();
        const range = document.createRange();
        range.selectNodeContents(newKeyEl);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  }
  /** Handle delete button click for any node.
   * Mutates `this.#data` directly, re-renders, then fires `json-viewer:delete` and
   * a `json-viewer:change` event on the parent container reflecting the updated value.
   * @param {HTMLElement} node - The `.jv-node` element to delete
   */
  _handleDelete(node) {
    const pathAttr = node.dataset.jvPath ?? "";
    const type = node.dataset.jvType ?? "string";
    const oldValue = this._getValueAtPath(pathAttr);
    const split = this._splitLastSegment(pathAttr);
    if (!split) return;
    const parent = this._getValueAtPath(split.parentPath);
    if (parent === null || parent === void 0 || typeof parent !== "object") return;
    let parentOldValue;
    if (Array.isArray(parent)) parentOldValue = [...parent];
    else if (parent instanceof Map) parentOldValue = new Map(parent);
    else if (parent instanceof Set) parentOldValue = new Set(parent);
    else parentOldValue = { ...parent };
    if (Array.isArray(parent)) {
      parent.splice(Number(split.key), 1);
    } else if (parent instanceof Map) {
      const mapKey = Array.from(parent.keys())[Number(split.key)];
      if (mapKey !== void 0) parent.delete(mapKey);
    } else if (parent instanceof Set) {
      const setVal = Array.from(parent)[Number(split.key)];
      parent.delete(setVal);
    } else {
      delete parent[
        /** @type {string} */
        split.key
      ];
    }
    let parentNewValue;
    if (Array.isArray(parent)) parentNewValue = [...parent];
    else if (parent instanceof Map) parentNewValue = new Map(parent);
    else if (parent instanceof Set) parentNewValue = new Set(parent);
    else parentNewValue = { ...parent };
    this._render();
    this._event("delete", { path: pathAttr, type, oldValue });
    const parentPath = split.parentPath || "(root)";
    this._event("change", { path: parentPath, oldValue: parentOldValue, newValue: parentNewValue, changeType: "removedProperty" });
    if (this.uib) this.uibSend("delete", { path: pathAttr, type, parentPath, newValue: parentNewValue, changeType: "removedProperty" });
  }
  /** Split a `data-jv-path` attribute value into its parent path and final key segment.
   * Handles dot notation (`a.b`), array-index notation (`a[0]`), and bracket-string
   * notation (`a["key with spaces"]`) as produced by {@link buildPath}.
   * @param {string} pathAttr - Raw data-jv-path value (e.g. `"a.b[2]"` or `"(root)"`)
   * @returns {{ parentPath: string, key: string|number }|null} Split result, or null for root
   */
  _splitLastSegment(pathAttr) {
    if (!pathAttr || pathAttr === "(root)") return null;
    const arrMatch = /^(.*?)\[(\d+)\]$/.exec(pathAttr);
    if (arrMatch) return { parentPath: arrMatch[1], key: parseInt(arrMatch[2], 10) };
    const bracketMatch = /^(.*?)\[["'](.+?)["']\]$/.exec(pathAttr);
    if (bracketMatch) return { parentPath: bracketMatch[1], key: bracketMatch[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\") };
    const dotIdx = pathAttr.lastIndexOf(".");
    if (dotIdx !== -1) return { parentPath: pathAttr.slice(0, dotIdx), key: pathAttr.slice(dotIdx + 1) };
    return { parentPath: "", key: pathAttr };
  }
  /** Copy the value of a node to the clipboard.
   * For leaf nodes reads the rendered text; for expandable nodes serialises to JSON.
   * @param {Element} node - The `.jv-node` element
   */
  _copyValue(node) {
    const path = (
      /** @type {HTMLElement} */
      node.dataset.jvPath ?? ""
    );
    const isExpandable = node.classList.contains("jv-object") || node.classList.contains("jv-array");
    let text;
    if (isExpandable) {
      const val = this._getValueAtPath(path);
      try {
        text = JSON.stringify(val, null, 2);
      } catch (_) {
        text = String(val);
      }
    } else {
      const valEl = node.querySelector(":scope > .jv-val");
      const rawText = valEl?.textContent ?? "";
      text = /** @type {HTMLElement} */
      node.dataset.jvType === "string" ? `"${rawText}"` : rawText;
    }
    this._writeClipboard(text ?? "", "value", path);
  }
  /** Dispatch the correct copy operation from a copy button click
   * @param {HTMLElement} btn - The `.jv-copy` button element
   */
  _handleCopy(btn) {
    const node = btn.closest(".jv-node");
    if (!node) return;
    const kind = btn.dataset.jvCopy ?? "path";
    if (kind === "value") this._copyValue(node);
    else this._copyPath(node);
  }
  /** Write text to the clipboard and dispatch a `json-viewer:copy` event.
   * Falls back to `document.execCommand('copy')` when the Clipboard API is unavailable.
   * @param {string}          text - Text to copy
   * @param {'path'|'value'} kind - What kind of thing was copied
   * @param {string}          path - Dot-notation path of the source node
   */
  async _writeClipboard(text, kind, path) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    this._event("copy", { path, text, kind });
  }
  // #endregion
};
if (typeof customElements !== "undefined") {
  customElements.define("json-viewer", JsonViewer);
  window["JsonViewer"] = JsonViewer;
}
var json_viewer_default = JsonViewer;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  renderToHTML
});
