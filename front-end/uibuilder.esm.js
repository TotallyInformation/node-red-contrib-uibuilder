var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value2) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value: value2 }) : obj[key] = value2;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __publicField = (obj, key, value2) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value2);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value2) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value2);
var __privateSet = (obj, member, value2, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value2) : member.set(obj, value2), value2);
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value2) {
    __privateSet(obj, member, value2, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});

// src/front-end-module/ui.js
var _a;
var Ui = (_a = class {
  //#endregion --- class variables ---
  /** Called when `new Ui(...)` is called
   * @param {globalThis} win Either the browser global window or jsdom dom.window
   * @param {Function} [extLog] A function that returns a function for logging
   * @param {Function} [jsonHighlight] A function that returns a highlighted HTML of JSON input
   */
  constructor(win, extLog, jsonHighlight) {
    //#region --- Class variables ---
    __publicField(this, "version", "7.5.0-src");
    // List of tags and attributes not in sanitise defaults but allowed in uibuilder.
    __publicField(this, "sanitiseExtraTags", ["uib-var"]);
    __publicField(this, "sanitiseExtraAttribs", ["variable", "report", "undefined"]);
    /** Optional Markdown-IT Plugins */
    __publicField(this, "ui_md_plugins");
    if (win) _a.win = win;
    else {
      throw new Error("Ui:constructor. Current environment does not include `window`, UI functions cannot be used.");
    }
    _a.doc = _a.win.document;
    if (extLog) _a.log = extLog;
    else _a.log = function() {
      return function() {
      };
    };
    if (jsonHighlight) this.syntaxHighlight = jsonHighlight;
    else this.syntaxHighlight = function() {
    };
    if (_a.win["markdownit"]) {
      _a.mdOpts = {
        html: true,
        xhtmlOut: false,
        linkify: true,
        _highlight: true,
        _strict: false,
        _view: "html",
        langPrefix: "language-",
        // NB: the highlightjs (hljs) library must be loaded before markdown-it for this to work
        highlight: function(str, lang) {
          if (lang && window["hljs"] && window["hljs"].getLanguage(lang)) {
            try {
              return '<pre class="">\n                                    <code class="hljs border">'.concat(window["hljs"].highlight(str, { language: lang, ignoreIllegals: true }).value, "</code></pre>");
            } finally {
            }
          }
          return '<pre class="hljs border"><code>'.concat(_a.md.utils.escapeHtml(str).trim(), "</code></pre>");
        }
      };
      _a.md = _a.win["markdownit"](_a.mdOpts);
    }
  }
  //#region ---- Internal Methods ----
  _markDownIt() {
    if (!_a.win["markdownit"]) return;
    if (!this.ui_md_plugins && _a.win["uibuilder"] && _a.win["uibuilder"].ui_md_plugins) this.ui_md_plugins = _a.win["uibuilder"].ui_md_plugins;
    _a.mdOpts = {
      html: true,
      xhtmlOut: false,
      linkify: true,
      _highlight: true,
      _strict: false,
      _view: "html",
      langPrefix: "language-",
      // NB: the highlightjs (hljs) library must be loaded before markdown-it for this to work
      highlight: function(str, lang) {
        if (window["hljs"]) {
          if (lang && window["hljs"].getLanguage(lang)) {
            try {
              return '<pre><code class="hljs border language-'.concat(lang, '" data-language="').concat(lang, '" title="Source language: \'').concat(lang, "'\">").concat(window["hljs"].highlight(str, { language: lang, ignoreIllegals: true }).value, "</code></pre>");
            } finally {
            }
          } else {
            try {
              const high = window["hljs"].highlightAuto(str);
              return '<pre><code class="hljs border language-'.concat(high.language, '" data-language="').concat(high.language, '" title="Source language estimated by HighlightJS: \'').concat(high.language, "'\">").concat(high.value, "</code></pre>");
            } finally {
            }
          }
        }
        return '<pre><code class="border">'.concat(_a.md.utils.escapeHtml(str).trim(), "</code></pre>");
      }
    };
    _a.md = _a.win["markdownit"](_a.mdOpts);
    if (this.ui_md_plugins) {
      if (!Array.isArray(this.ui_md_plugins)) {
        _a.log("error", "Ui:_markDownIt:plugins", "Could not load plugins, ui_md_plugins is not an array")();
        return;
      }
      this.ui_md_plugins.forEach((plugin) => {
        if (typeof plugin === "string") {
          _a.md.use(_a.win[plugin]);
        } else {
          const name2 = Object.keys(plugin)[0];
          _a.md.use(_a.win[name2], plugin[name2]);
        }
      });
    }
  }
  /** Show a browser notification if the browser and the user allows it
   * @param {object} config Notification config data
   * @returns {Promise} Resolves on close or click event, returns the event.
   */
  _showNotification(config) {
    if (config.topic && !config.title) config.title = config.topic;
    if (!config.title) config.title = "uibuilder notification";
    if (config.payload && !config.body) config.body = config.payload;
    if (!config.body) config.body = " No message given.";
    try {
      const notify = new Notification(config.title, config);
      return new Promise((resolve, reject) => {
        notify.addEventListener("close", (ev) => {
          ev.currentTarget.userAction = "close";
          resolve(ev);
        });
        notify.addEventListener("click", (ev) => {
          ev.currentTarget.userAction = "click";
          resolve(ev);
        });
        notify.addEventListener("error", (ev) => {
          ev.currentTarget.userAction = "error";
          reject(ev);
        });
      });
    } catch (e) {
      return Promise.reject(new Error("Browser refused to create a Notification"));
    }
  }
  // Vue dynamic inserts Don't really work ...
  // _uiAddVue(ui, isRecurse) {
  //     // must be Vue
  //     // must have only 1 root element
  //     const compToAdd = ui.components[0]
  //     const newEl = Ui.doc.createElement(compToAdd.type)
  //     if (!compToAdd.slot && ui.payload) compToAdd.slot = ui.payload
  //     this._uiComposeComponent(newEl, compToAdd)
  //     // If nested components, go again - but don't pass payload to sub-components
  //     if (compToAdd.components) {
  //         this._uiExtendEl(newEl, compToAdd.components)
  //     }
  //     console.log('MAGIC: ', this.magick, newEl, newEl.outerHTML)()
  //     this.set('magick', newEl.outerHTML)
  //     // if (compToAdd.id) newEl.setAttribute('ref', compToAdd.id)
  //     // if (elParent.id) newEl.setAttribute('data-parent', elParent.id)
  // }
  // TODO Add check if ID already exists
  // TODO Allow single add without using components array
  /** Handle incoming msg._ui add requests
   * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
   * @param {boolean} isRecurse Is this a recursive call?
   */
  _uiAdd(ui, isRecurse) {
    _a.log("trace", "Ui:_uiManager:add", "Starting _uiAdd")();
    ui.components.forEach((compToAdd, i) => {
      _a.log("trace", "Ui:_uiAdd:components-forEach:".concat(i), "Component to add: ", compToAdd)();
      let newEl;
      switch (compToAdd.type) {
        // If trying to insert raw html, wrap in a div
        case "html": {
          compToAdd.ns = "html";
          newEl = _a.doc.createElement("div");
          break;
        }
        // If trying to insert raw svg, need to create in namespace
        case "svg": {
          compToAdd.ns = "svg";
          newEl = _a.doc.createElementNS("http://www.w3.org/2000/svg", "svg");
          break;
        }
        default: {
          compToAdd.ns = "dom";
          newEl = _a.doc.createElement(compToAdd.type);
          break;
        }
      }
      if (!compToAdd.slot && ui.payload) compToAdd.slot = ui.payload;
      this._uiComposeComponent(newEl, compToAdd);
      let elParent;
      if (compToAdd.parentEl) {
        elParent = compToAdd.parentEl;
      } else if (ui.parentEl) {
        elParent = ui.parentEl;
      } else if (compToAdd.parent) {
        elParent = _a.doc.querySelector(compToAdd.parent);
      } else if (ui.parent) {
        elParent = _a.doc.querySelector(ui.parent);
      }
      if (!elParent) {
        _a.log("info", "Ui:_uiAdd", "No parent found, adding to body")();
        elParent = _a.doc.querySelector("body");
      }
      if (compToAdd.position && compToAdd.position === "first") {
        elParent.insertBefore(newEl, elParent.firstChild);
      } else if (compToAdd.position && Number.isInteger(Number(compToAdd.position))) {
        elParent.insertBefore(newEl, elParent.children[compToAdd.position]);
      } else {
        elParent.appendChild(newEl);
      }
      if (compToAdd.components) {
        this._uiExtendEl(newEl, compToAdd.components, compToAdd.ns);
      }
    });
  }
  // --- end of _uiAdd ---
  /** Enhance an HTML element that is being composed with ui data
   *  such as ID, attribs, event handlers, custom props, etc.
   * @param {*} el HTML Element to enhance
   * @param {*} comp Individual uibuilder ui component spec
   */
  _uiComposeComponent(el, comp) {
    if (comp.attributes) {
      Object.keys(comp.attributes).forEach((attrib) => {
        if (attrib === "class" && Array.isArray(comp.attributes[attrib])) comp.attributes[attrib].join(" ");
        _a.log("trace", "_uiComposeComponent:attributes-forEach", "Attribute: '".concat(attrib, "', value: '").concat(comp.attributes[attrib], "'"))();
        if (attrib === "value") el.value = comp.attributes[attrib];
        if (attrib.startsWith("xlink:")) el.setAttributeNS("http://www.w3.org/1999/xlink", attrib, comp.attributes[attrib]);
        else el.setAttribute(attrib, comp.attributes[attrib]);
      });
    }
    if (comp.id) el.setAttribute("id", comp.id);
    if (comp.type === "svg") {
      el.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
      el.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    }
    if (comp.events) {
      Object.keys(comp.events).forEach((type) => {
        if (type.toLowerCase === "onclick") type = "click";
        try {
          el.addEventListener(type, (evt) => {
            new Function("evt", "".concat(comp.events[type], "(evt)"))(evt);
          });
        } catch (err) {
          _a.log("error", "Ui:_uiComposeComponent", "Add event '".concat(type, "' for element '").concat(comp.type, "': Cannot add event handler. ").concat(err.message))();
        }
      });
    }
    if (comp.properties) {
      Object.keys(comp.properties).forEach((prop) => {
        el[prop] = comp.properties[prop];
        if (["value", "checked"].includes(prop)) {
          el.dispatchEvent(new Event("input"));
          el.dispatchEvent(new Event("change"));
        }
      });
    }
    if (comp.slot) {
      this.replaceSlot(el, comp.slot);
    }
    if (comp.slotMarkdown) {
      this.replaceSlotMarkdown(el, comp);
    }
  }
  /** Extend an HTML Element with appended elements using ui components
   * NOTE: This fn follows a strict hierarchy of added components.
   * @param {HTMLElement} parentEl The parent HTML Element we want to append to
   * @param {*} components The ui component(s) we want to add
   * @param {string} [ns] Optional. The namespace to use.
   */
  _uiExtendEl(parentEl, components, ns = "") {
    components.forEach((compToAdd, i) => {
      _a.log("trace", "Ui:_uiExtendEl:components-forEach:".concat(i), compToAdd)();
      let newEl;
      compToAdd.ns = ns;
      if (compToAdd.ns === "html") {
        newEl = parentEl;
        this.replaceSlot(parentEl, compToAdd.slot);
      } else if (compToAdd.ns === "svg") {
        newEl = _a.doc.createElementNS("http://www.w3.org/2000/svg", compToAdd.type);
        this._uiComposeComponent(newEl, compToAdd);
        parentEl.appendChild(newEl);
      } else {
        newEl = _a.doc.createElement(compToAdd.type === "html" ? "div" : compToAdd.type);
        this._uiComposeComponent(newEl, compToAdd);
        parentEl.appendChild(newEl);
      }
      if (compToAdd.components) {
        this._uiExtendEl(newEl, compToAdd.components, compToAdd.ns);
      }
    });
  }
  // TODO Add more error handling and parameter validation
  /** Handle incoming _ui load requests
   * Can load JavaScript modules, JavaScript scripts and CSS.
   * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
   */
  _uiLoad(ui) {
    if (ui.components) {
      if (!Array.isArray(ui.components)) ui.components = [ui.components];
      ui.components.forEach(async (component) => {
        Promise.resolve().then(() => __toESM(__require(component)));
      });
    }
    if (ui.srcScripts) {
      if (!Array.isArray(ui.srcScripts)) ui.srcScripts = [ui.srcScripts];
      ui.srcScripts.forEach((script) => {
        this.loadScriptSrc(script);
      });
    }
    if (ui.txtScripts) {
      if (!Array.isArray(ui.txtScripts)) ui.txtScripts = [ui.txtScripts];
      this.loadScriptTxt(ui.txtScripts.join("\n"));
    }
    if (ui.srcStyles) {
      if (!Array.isArray(ui.srcStyles)) ui.srcStyles = [ui.srcStyles];
      ui.srcStyles.forEach((sheet) => {
        this.loadStyleSrc(sheet);
      });
    }
    if (ui.txtStyles) {
      if (!Array.isArray(ui.txtStyles)) ui.txtStyles = [ui.txtStyles];
      this.loadStyleTxt(ui.txtStyles.join("\n"));
    }
  }
  // --- end of _uiLoad ---
  /** Handle incoming _ui messages and loaded UI JSON files
   * Called from start()
   * @param {*} msg Standardised msg object containing a _ui property object
   */
  _uiManager(msg) {
    if (!msg._ui) return;
    if (!Array.isArray(msg._ui)) msg._ui = [msg._ui];
    msg._ui.forEach((ui, i) => {
      if (ui.mode && !ui.method) ui.method = ui.mode;
      if (!ui.method) {
        _a.log("error", "Ui:_uiManager", "No method defined for msg._ui[".concat(i, "]. Ignoring. "), ui)();
        return;
      }
      ui.payload = msg.payload;
      ui.topic = msg.topic;
      switch (ui.method) {
        case "add": {
          this._uiAdd(ui, false);
          break;
        }
        case "remove": {
          this._uiRemove(ui, false);
          break;
        }
        case "removeAll": {
          this._uiRemove(ui, true);
          break;
        }
        case "replace": {
          this._uiReplace(ui);
          break;
        }
        case "update": {
          this._uiUpdate(ui);
          break;
        }
        case "load": {
          this._uiLoad(ui);
          break;
        }
        case "reload": {
          this._uiReload();
          break;
        }
        case "notify": {
          this.showDialog("notify", ui, msg);
          break;
        }
        case "alert": {
          this.showDialog("alert", ui, msg);
          break;
        }
        default: {
          _a.log("error", "Ui:_uiManager", "Invalid msg._ui[".concat(i, "].method (").concat(ui.method, "). Ignoring"))();
          break;
        }
      }
    });
  }
  // --- end of _uiManager ---
  /** Handle a reload request */
  _uiReload() {
    _a.log("trace", "Ui:uiManager:reload", "reloading")();
    location.reload();
  }
  // TODO Add better tests for failures (see comments)
  /** Handle incoming _ui remove requests
   * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
   * @param {boolean} all Optional, default=false. If true, will remove ALL found elements, otherwise only the 1st is removed
   */
  _uiRemove(ui, all = false) {
    ui.components.forEach((compToRemove) => {
      let els;
      if (all !== true) els = [_a.doc.querySelector(compToRemove)];
      else els = _a.doc.querySelectorAll(compToRemove);
      els.forEach((el) => {
        try {
          el.remove();
        } catch (err) {
          _a.log("trace", "Ui:_uiRemove", "Could not remove. ".concat(err.message))();
        }
      });
    });
  }
  // --- end of _uiRemove ---
  /** Handle incoming _ui replace requests
   * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
   */
  _uiReplace(ui) {
    _a.log("trace", "Ui:_uiReplace", "Starting")();
    ui.components.forEach((compToReplace, i) => {
      _a.log("trace", "Ui:_uiReplace:components-forEach:".concat(i), "Component to replace: ", compToReplace)();
      let elToReplace;
      if (compToReplace.id) {
        elToReplace = _a.doc.getElementById(compToReplace.id);
      } else if (compToReplace.selector || compToReplace.select) {
        elToReplace = _a.doc.querySelector(compToReplace.selector);
      } else if (compToReplace.name) {
        elToReplace = _a.doc.querySelector('[name="'.concat(compToReplace.name, '"]'));
      } else if (compToReplace.type) {
        elToReplace = _a.doc.querySelector(compToReplace.type);
      }
      _a.log("trace", "Ui:_uiReplace:components-forEach:".concat(i), "Element to replace: ", elToReplace)();
      if (elToReplace === void 0 || elToReplace === null) {
        _a.log("trace", "Ui:_uiReplace:components-forEach:".concat(i, ":noReplace"), "Cannot find the DOM element. Adding instead.", compToReplace)();
        this._uiAdd({ components: [compToReplace] }, false);
        return;
      }
      let newEl;
      switch (compToReplace.type) {
        // If trying to insert raw html, wrap in a div
        case "html": {
          compToReplace.ns = "html";
          newEl = _a.doc.createElement("div");
          break;
        }
        // If trying to insert raw svg, need to create in namespace
        case "svg": {
          compToReplace.ns = "svg";
          newEl = _a.doc.createElementNS("http://www.w3.org/2000/svg", "svg");
          break;
        }
        default: {
          compToReplace.ns = "dom";
          newEl = _a.doc.createElement(compToReplace.type);
          break;
        }
      }
      this._uiComposeComponent(newEl, compToReplace);
      elToReplace.replaceWith(newEl);
      if (compToReplace.components) {
        this._uiExtendEl(newEl, compToReplace.components, compToReplace.ns);
      }
    });
  }
  // --- end of _uiReplace ---
  // TODO Allow single add without using components array
  // TODO Allow sub-components
  // TODO Add multi-slot capability
  /** Handle incoming _ui update requests
   * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
   */
  _uiUpdate(ui) {
    _a.log("trace", "UI:_uiUpdate:update", "Starting _uiUpdate", ui)();
    if (!ui.components) ui.components = [Object.assign({}, ui)];
    ui.components.forEach((compToUpd, i) => {
      _a.log("trace", "_uiUpdate:components-forEach", "Start loop #".concat(i), compToUpd)();
      let elToUpd;
      if (compToUpd.parentEl) {
        elToUpd = compToUpd.parentEl;
      } else if (compToUpd.id) {
        elToUpd = _a.doc.querySelectorAll("#".concat(compToUpd.id));
      } else if (compToUpd.selector || compToUpd.select) {
        elToUpd = _a.doc.querySelectorAll(compToUpd.selector);
      } else if (compToUpd.name) {
        elToUpd = _a.doc.querySelectorAll('[name="'.concat(compToUpd.name, '"]'));
      } else if (compToUpd.type) {
        elToUpd = _a.doc.querySelectorAll(compToUpd.type);
      }
      if (elToUpd === void 0 || elToUpd.length < 1) {
        _a.log("warn", "Ui:_uiManager:update", "Cannot find the DOM element. Ignoring.", compToUpd)();
        return;
      }
      _a.log("trace", "_uiUpdate:components-forEach", "Element(s) to update. Count: ".concat(elToUpd.length), elToUpd)();
      if (!compToUpd.slot && compToUpd.payload) compToUpd.slot = compToUpd.payload;
      elToUpd.forEach((el, j) => {
        _a.log("trace", "_uiUpdate:components-forEach", "Updating element #".concat(j), el)();
        this._uiComposeComponent(el, compToUpd);
        if (compToUpd.components) {
          _a.log("trace", "_uiUpdate:nested-component", "Element #".concat(j, " - nested-component"), compToUpd, el)();
          const nc = { _ui: [] };
          compToUpd.components.forEach((nestedComp, k) => {
            const method = nestedComp.method || compToUpd.method || ui.method;
            if (nestedComp.method) delete nestedComp.method;
            if (!Array.isArray(nestedComp)) nestedComp = [nestedComp];
            _a.log("trace", "_uiUpdate:nested-component", "Element #".concat(j, " - nested-component #").concat(k), nestedComp)();
            nc._ui.push({
              method,
              parentEl: el,
              components: nestedComp
            });
          });
          _a.log("trace", "_uiUpdate:nested-component", "Element #".concat(j, " - nested-component new manager"), nc)();
          this._uiManager(nc);
        }
      });
    });
  }
  // --- end of _uiUpdate ---
  //#endregion ---- -------- ----
  //#region ---- External Methods ----
  /** Simplistic jQuery-like document CSS query selector, returns an HTML Element
   * NOTE that this fn returns the element itself. Use $$ to get the properties of 1 or more elements.
   * If the selected element is a <template>, returns the first child element.
   * type {HTMLElement}
   * @param {string} cssSelector A CSS Selector that identifies the element to return
   * @param {"el"|"text"|"html"|"attributes"|"attr"} [output] Optional. What type of output to return. Defaults to "el", the DOM element reference
   * @param {HTMLElement} [context] Optional. The context to search within. Defaults to the document. Must be a DOM element.
   * @returns {HTMLElement|string|Array|null} Selected HTML DOM element, innerText, innerHTML, attribute list or null
   */
  $(cssSelector, output, context) {
    if (!context) context = _a.doc;
    if (!output) output = "el";
    if (!context || !context.nodeType) {
      _a.log(1, "Uib:$", "Invalid context element. Must be a valid HTML element.", context)();
      return null;
    }
    let el = context.querySelector(cssSelector);
    if (!el || !el.nodeType) {
      _a.log(1, "Uib:$", "No element found or element is not an HTML element for CSS selector ".concat(cssSelector))();
      return null;
    }
    if (el.nodeName === "TEMPLATE") {
      el = el.content.firstElementChild;
      if (!el) {
        _a.log(0, "Uib:$", "Template selected for CSS selector ".concat(cssSelector, " but it is empty"))();
        return null;
      }
    }
    let out;
    try {
      switch (output.toLowerCase()) {
        case "text": {
          out = el.innerText;
          break;
        }
        case "html": {
          out = el.innerHTML;
          break;
        }
        case "attr":
        case "attributes": {
          out = {};
          for (const attr of el.attributes) {
            out[attr.name] = attr.value;
          }
          break;
        }
        default: {
          out = el;
          break;
        }
      }
    } catch (e) {
      out = el;
      _a.log(1, "Uib:$", 'Could not process output type "'.concat(output, '" for CSS selector ').concat(cssSelector, ", returned the DOM element. ").concat(e.message), e)();
    }
    return out;
  }
  /** CSS query selector that returns ALL found selections. Matches the Chromium DevTools feature of the same name.
   * NOTE that this fn returns an array showing the PROPERTIES of the elements whereas $ returns the element itself
   * @param {string} cssSelector A CSS Selector that identifies the elements to return
   * @param {HTMLElement} [context] Optional. The context to search within. Defaults to the document. Must be a DOM element.
   * @returns {HTMLElement[]} Array of DOM elements/nodes. Array is empty if selector is not found.
   */
  $$(cssSelector, context) {
    if (!context) context = _a.doc;
    if (!context || !context.nodeType) {
      _a.log(1, "Uib:$$", "Invalid context element. Must be a valid HTML element.", context)();
      return null;
    }
    return Array.from(context.querySelectorAll(cssSelector));
  }
  /** Add 1 or several class names to an element
   * @param {string|string[]} classNames Single or array of classnames
   * @param {HTMLElement} el HTML Element to add class(es) to
   */
  addClass(classNames, el) {
    if (!Array.isArray(classNames)) classNames = [classNames];
    if (el) el.classList.add(...classNames);
  }
  /** Apply a source template tag to a target html element
   * NOTES:
   * - Any attributes are only applied to the 1ST ELEMENT of the template content. Use a wrapper div if you need to apply to multiple elements.
   * - When using 'wrap' mode, the target content is placed into the template's 1ST <slot> only (if present).
   * - styles in ALL templates are accessible to all templates & impact the whole page.
   * - scripts in templates are run AT TIME OF APPLICATION (so may run multiple times).
   * - scripts in templates are applied in order of application, so variables may not yet exist if defined in subsequent templates
   * @param {string} sourceId The HTML ID of the source element
   * @param {string} targetId The HTML ID of the target element
   * @param {object} config Configuration options
   *   @param {boolean=} config.onceOnly   If true, the source will be adopted (the source is moved)
   *   @param {object=}  config.attributes A set of key:value pairs that will be applied as attributes to the 1ST ELEMENT ONLY of the target
   *   @param {'insert'|'replace'|'wrap'}  config.mode How to apply the template. Default is 'insert'. 'replace' will replace the targets innerHTML. 'wrap' is like 'replace' but will put any target content into the template's 1ST <slot> (if present).
   */
  applyTemplate(sourceId, targetId, config) {
    var _a3;
    if (!config) config = {};
    if (!config.onceOnly) config.onceOnly = false;
    if (!config.mode) config.mode = "insert";
    const template = _a.doc.getElementById(sourceId);
    if (!template || template.tagName !== "TEMPLATE") {
      _a.log("error", "Ui:applyTemplate", "Source must be a <template>. id='".concat(sourceId, "'"))();
      return;
    }
    const target = _a.doc.getElementById(targetId);
    if (!target) {
      _a.log("error", "Ui:applyTemplate", "Target not found: id='".concat(targetId, "'"))();
      return;
    }
    const targetContent = (_a3 = target.innerHTML) != null ? _a3 : "";
    if (targetContent && config.mode === "replace") {
      _a.log("warn", "Ui:applyTemplate", "Target element is not empty, content is replaced. id='".concat(targetId, "'"))();
    }
    let templateContent;
    if (config.onceOnly === true) templateContent = _a.doc.adoptNode(template.content);
    else templateContent = _a.doc.importNode(template.content, true);
    if (templateContent) {
      if (config.attributes) {
        const el = templateContent.firstElementChild;
        Object.keys(config.attributes).forEach((attrib) => {
          el.setAttribute(attrib, config.attributes[attrib]);
        });
      }
      if (config.mode === "insert") {
        target.appendChild(templateContent);
      } else if (config.mode === "replace") {
        target.innerHTML = "";
        target.appendChild(templateContent);
      } else if (config.mode === "wrap") {
        target.innerHTML = "";
        target.appendChild(templateContent);
        if (targetContent) {
          const slot = target.getElementsByTagName("slot");
          if (slot.length > 0) {
            slot[0].innerHTML = targetContent;
          }
        }
      }
    } else {
      _a.log("warn", "Ui:applyTemplate", "No valid content found in template")();
    }
  }
  /** Converts markdown text input to HTML if the Markdown-IT library is loaded
   * Otherwise simply returns the text
   * @param {string} mdText The input markdown string
   * @returns {string} HTML (if Markdown-IT library loaded and parse successful) or original text
   */
  convertMarkdown(mdText) {
    if (!mdText) return "";
    if (!_a.win["markdownit"]) return mdText;
    if (!_a.md) this._markDownIt();
    try {
      return _a.md.render(mdText.trim());
    } catch (e) {
      _a.log(0, "uibuilder:convertMarkdown", "Could not render Markdown. ".concat(e.message), e)();
      return '<p class="border error">Could not render Markdown<p>';
    }
  }
  /** Include HTML fragment, img, video, text, json, form data, pdf or anything else from an external file or API
   * Wraps the included object in a div tag.
   * PDF's, text or unknown MIME types are also wrapped in an iFrame.
   * @param {string} url The URL of the source file to include
   * @param {object} uiOptions Object containing properties recognised by the _uiReplace function. Must at least contain an id
   * param {string} uiOptions.id The HTML ID given to the wrapping DIV tag
   * param {string} uiOptions.parentSelector The CSS selector for a parent element to insert the new HTML under (defaults to 'body')
   * @returns {Promise<any>} Status
   */
  async include(url2, uiOptions) {
    if (!fetch) {
      _a.log(0, "Ui:include", "Current environment does not include `fetch`, skipping.")();
      return "Current environment does not include `fetch`, skipping.";
    }
    if (!url2) {
      _a.log(0, "Ui:include", "url parameter must be provided, skipping.")();
      return "url parameter must be provided, skipping.";
    }
    if (!uiOptions || !uiOptions.id) {
      _a.log(0, "Ui:include", "uiOptions parameter MUST be provided and must contain at least an `id` property, skipping.")();
      return "uiOptions parameter MUST be provided and must contain at least an `id` property, skipping.";
    }
    let response;
    try {
      response = await fetch(url2);
    } catch (error) {
      _a.log(0, "Ui:include", "Fetch of file '".concat(url2, "' failed. "), error.message)();
      return error.message;
    }
    if (!response.ok) {
      _a.log(0, "Ui:include", "Fetch of file '".concat(url2, "' failed. Status='").concat(response.statusText, "'"))();
      return response.statusText;
    }
    const contentType = await response.headers.get("content-type");
    let type = null;
    if (contentType) {
      if (contentType.includes("text/html")) {
        type = "html";
      } else if (contentType.includes("application/json")) {
        type = "json";
      } else if (contentType.includes("multipart/form-data")) {
        type = "form";
      } else if (contentType.includes("image/")) {
        type = "image";
      } else if (contentType.includes("video/")) {
        type = "video";
      } else if (contentType.includes("application/pdf")) {
        type = "pdf";
      } else if (contentType.includes("text/plain")) {
        type = "text";
      }
    }
    let slot = "";
    let txtReturn = "Include successful";
    let data;
    switch (type) {
      case "html": {
        data = await response.text();
        slot = data;
        break;
      }
      case "json": {
        data = await response.json();
        slot = '<pre class="syntax-highlight">';
        slot += this.syntaxHighlight(data);
        slot += "</pre>";
        break;
      }
      case "form": {
        data = await response.formData();
        slot = '<pre class="syntax-highlight">';
        slot += this.syntaxHighlight(data);
        slot += "</pre>";
        break;
      }
      case "image": {
        data = await response.blob();
        slot = '<img src="'.concat(URL.createObjectURL(data), '">');
        if (_a.win["DOMPurify"]) {
          txtReturn = "Include successful. BUT DOMPurify loaded which may block its use.";
          _a.log("warn", "Ui:include:image", txtReturn)();
        }
        break;
      }
      case "video": {
        data = await response.blob();
        slot = '<video controls autoplay><source src="'.concat(URL.createObjectURL(data), '"></video>');
        if (_a.win["DOMPurify"]) {
          txtReturn = "Include successful. BUT DOMPurify loaded which may block its use.";
          _a.log("warn", "Ui:include:video", txtReturn)();
        }
        break;
      }
      case "pdf":
      case "text":
      default: {
        data = await response.blob();
        slot = '<iframe style="resize:both;width:inherit;height:inherit;" src="'.concat(URL.createObjectURL(data), '">');
        if (_a.win["DOMPurify"]) {
          txtReturn = "Include successful. BUT DOMPurify loaded which may block its use.";
          _a.log("warn", "Ui:include:".concat(type), txtReturn)();
        }
        break;
      }
    }
    uiOptions.type = "div";
    uiOptions.slot = slot;
    if (!uiOptions.parent) uiOptions.parent = "body";
    if (!uiOptions.attributes) uiOptions.attributes = { class: "included" };
    this._uiReplace({
      components: [
        uiOptions
      ]
    });
    _a.log("trace", "Ui:include:".concat(type), txtReturn)();
    return txtReturn;
  }
  // ---- End of include() ---- //
  /** Attach a new remote script to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} url The url to be used in the script src attribute
   */
  loadScriptSrc(url2) {
    const newScript = _a.doc.createElement("script");
    newScript.src = url2;
    newScript.async = false;
    _a.doc.head.appendChild(newScript);
  }
  /** Attach a new text script to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} textFn The text to be loaded as a script
   */
  loadScriptTxt(textFn) {
    const newScript = _a.doc.createElement("script");
    newScript.async = false;
    newScript.textContent = textFn;
    _a.doc.head.appendChild(newScript);
  }
  /** Attach a new remote stylesheet link to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} url The url to be used in the style link href attribute
   */
  loadStyleSrc(url2) {
    const newStyle = _a.doc.createElement("link");
    newStyle.href = url2;
    newStyle.rel = "stylesheet";
    newStyle.type = "text/css";
    _a.doc.head.appendChild(newStyle);
  }
  /** Attach a new text stylesheet to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} textFn The text to be loaded as a stylesheet
   */
  loadStyleTxt(textFn) {
    const newStyle = _a.doc.createElement("style");
    newStyle.textContent = textFn;
    _a.doc.head.appendChild(newStyle);
  }
  /** Load a dynamic UI from a JSON web reponse
   * @param {string} url URL that will return the ui JSON
   */
  loadui(url2) {
    if (!fetch) {
      _a.log(0, "Ui:loadui", "Current environment does not include `fetch`, skipping.")();
      return;
    }
    if (!url2) {
      _a.log(0, "Ui:loadui", "url parameter must be provided, skipping.")();
      return;
    }
    fetch(url2).then((response) => {
      if (response.ok === false) {
        throw new Error("Could not load '".concat(url2, "'. Status ").concat(response.status, ", Error: ").concat(response.statusText));
      }
      _a.log("trace", "Ui:loadui:then1", "Loaded '".concat(url2, "'. Status ").concat(response.status, ", ").concat(response.statusText))();
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Fetch '".concat(url2, "' did not return JSON, ignoring"));
      }
      return response.json();
    }).then((data) => {
      if (data !== void 0) {
        _a.log("trace", "Ui:loadui:then2", "Parsed JSON successfully obtained")();
        this._uiManager({ _ui: data });
        return true;
      }
      return false;
    }).catch((err) => {
      _a.log("warn", "Ui:loadui:catch", "Error. ", err)();
    });
  }
  // --- end of loadui
  /** ! NOT COMPLETE Move an element from one position to another
   * @param {object} opts Options
   * @param {string} opts.sourceSelector Required, CSS Selector that identifies the element to be moved
   * @param {string} opts.targetSelector Required, CSS Selector that identifies the element to be moved
   */
  moveElement(opts) {
    const { sourceSelector, targetSelector, moveType, position } = opts;
    const sourceEl = document.querySelector(sourceSelector);
    if (!sourceEl) {
      _a.log(0, "Ui:moveElement", "Source element not found")();
      return;
    }
    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) {
      _a.log(0, "Ui:moveElement", "Target element not found")();
      return;
    }
  }
  /** Get standard data from a DOM node.
   * @param {*} node DOM node to examine
   * @param {string} cssSelector Identify the DOM element to get data from
   * @returns {object} Standardised data object
   */
  nodeGet(node, cssSelector) {
    const thisOut = {
      id: node.id === "" ? void 0 : node.id,
      name: node.name,
      children: node.childNodes.length,
      type: node.nodeName,
      attributes: void 0,
      isUserInput: node.validity ? true : false,
      userInput: !node.validity ? void 0 : {
        value: node.value,
        validity: void 0,
        willValidate: node.willValidate,
        valueAsDate: node.valueAsDate,
        valueAsNumber: node.valueAsNumber,
        type: node.type
      }
    };
    if (["UL", "OL"].includes(node.nodeName)) {
      const listEntries = _a.doc.querySelectorAll("".concat(cssSelector, " li"));
      if (listEntries) {
        thisOut.list = {
          "entries": listEntries.length
        };
      }
    }
    if (node.nodeName === "DL") {
      const listEntries = _a.doc.querySelectorAll("".concat(cssSelector, " dt"));
      if (listEntries) {
        thisOut.list = {
          "entries": listEntries.length
        };
      }
    }
    if (node.nodeName === "TABLE") {
      const bodyEntries = _a.doc.querySelectorAll("".concat(cssSelector, " > tbody > tr"));
      const headEntries = _a.doc.querySelectorAll("".concat(cssSelector, " > thead > tr"));
      const cols = _a.doc.querySelectorAll("".concat(cssSelector, " > tbody > tr:last-child > *"));
      if (bodyEntries || headEntries || cols) {
        thisOut.table = {
          "headRows": headEntries ? headEntries.length : 0,
          "bodyRows": bodyEntries ? bodyEntries.length : 0,
          "columns": cols ? cols.length : 0
        };
      }
    }
    if (node.nodeName !== "#text" && node.attributes && node.attributes.length > 0) {
      thisOut.attributes = {};
      for (const attrib of node.attributes) {
        if (attrib.name !== "id") {
          thisOut.attributes[attrib.name] = node.attributes[attrib.name].value;
        }
        if (attrib.name === "class") thisOut.classes = Array.from(node.classList);
      }
    }
    if (node.nodeName === "#text") {
      thisOut.text = node.textContent;
    }
    if (node.validity) thisOut.userInput.validity = {};
    for (const v in node.validity) {
      thisOut.userInput.validity[v] = node.validity[v];
    }
    return thisOut;
  }
  // --- end of nodeGet --- //
  /** Show a browser notification if possible. Returns a promise
   * Config can be a simple string, a Node-RED msg (topic as title, payload as body)
   * or a Notifications API options object + config.title string.
   * Config ref: https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
   * @param {object|string} config Notification config object or simple message string
   * @returns {Promise} Resolves on close or click event, returns the event.
   */
  async notification(config) {
    if (typeof config === "string") {
      config = { body: config };
    }
    if (typeof Notification === "undefined") return Promise.reject(new Error("Notifications not available in this browser"));
    let permit = Notification.permission;
    if (permit === "denied") {
      return Promise.reject(new Error("Notifications not permitted by user"));
    } else if (permit === "granted") {
      return this._showNotification(config);
    }
    permit = await Notification.requestPermission();
    if (permit === "granted") {
      return this._showNotification(config);
    }
    return Promise.reject(new Error("Notifications not permitted by user"));
  }
  /** Remove All, 1 or more class names from an element
   * @param {undefined|null|""|string|string[]} classNames Single or array of classnames. If undefined, "" or null, remove all classes
   * @param {HTMLElement} el HTML Element to add class(es) to
   */
  removeClass(classNames, el) {
    if (!classNames) {
      el.removeAttribute("class");
      return;
    }
    if (!Array.isArray(classNames)) classNames = [classNames];
    if (el) el.classList.remove(...classNames);
  }
  /** Replace or add an HTML element's slot from text or an HTML string
   * WARNING: Executes <script> tags! And will process <style> tags.
   * Will use DOMPurify if that library has been loaded to window.
   * param {*} ui Single entry from the msg._ui property
   * @param {Element} el Reference to the element that we want to update
   * @param {*} slot The slot content we are trying to add/replace (defaults to empty string)
   */
  replaceSlot(el, slot) {
    if (!el) return;
    if (!slot) slot = "";
    slot = this.sanitiseHTML(slot);
    const tempFrag = _a.doc.createRange().createContextualFragment(slot);
    const elRange = _a.doc.createRange();
    elRange.selectNodeContents(el);
    elRange.deleteContents();
    el.append(tempFrag);
  }
  /** Replace or add an HTML element's slot from a Markdown string
   * Only does something if the markdownit library has been loaded to window.
   * Will use DOMPurify if that library has been loaded to window.
   * @param {Element} el Reference to the element that we want to update
   * @param {*} component The component we are trying to add/replace
   */
  replaceSlotMarkdown(el, component) {
    if (!el) return;
    if (!component.slotMarkdown) return;
    component.slotMarkdown = this.convertMarkdown(component.slotMarkdown);
    component.slotMarkdown = this.sanitiseHTML(component.slotMarkdown);
    el.innerHTML = component.slotMarkdown;
  }
  /** Sanitise HTML to make it safe - if the DOMPurify library is loaded
   * Otherwise just returns that HTML as-is.
   * @param {string} html The input HTML string
   * @returns {string} The sanitised HTML or the original if DOMPurify not loaded
   */
  sanitiseHTML(html) {
    if (!_a.win["DOMPurify"]) return html;
    return _a.win["DOMPurify"].sanitize(html, { ADD_TAGS: this.sanitiseExtraTags, ADD_ATTR: this.sanitiseExtraAttribs });
  }
  /** Show a pop-over "toast" dialog or a modal alert // TODO - Allow notify to sit in corners rather than take over the screen
   * Refs: https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/alertdialog.html,
   *       https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/dialog.html,
   *       https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
   * @param {"notify"|"alert"} type Dialog type
   * @param {object} ui standardised ui data
   * @param {object} [msg] msg.payload/msg.topic - only used if a string. Optional.
   * @returns {void}
   */
  showDialog(type, ui, msg) {
    let body = "";
    if (msg.payload && typeof msg.payload === "string") body += "<div>".concat(msg.payload, "</div>");
    if (ui.content) body += "<div>".concat(ui.content, "</div>");
    if (body === "") {
    let content = "";
    if (msg && msg.payload && typeof msg.payload === "string") content += "<div>".concat(msg.payload, "</div>");
    if (ui.content) content += "<div>".concat(ui.content, "</div>");
    if (content === "") {
      _a.log(1, "Ui:showDialog", "Toast content is blank. Not shown.")();
      return;
    }
    let title = "";
    if (ui.title) title = ui.title;
    else if (msg.topic) title = msg.topic;
    if (ui.noAutohide) ui.noAutoHide = ui.noAutohide;
    if (ui.noAutoHide) ui.autohide = !ui.noAutoHide;
    if (ui.autoHideDelay) {
      if (!ui.autohide) ui.autohide = true;
      ui.delay = ui.autoHideDelay;
    } else ui.autoHideDelay = 1e4;
    if (!Object.prototype.hasOwnProperty.call(ui, "autohide")) ui.autohide = true;
    let content = "";
    let icon = "";
    if (type === "alert") {
      icon = '<svg viewBox="0 0 192.146 192.146"><path d="M108.186 144.372c0 7.054-4.729 12.32-12.037 12.32h-.254c-7.054 0-11.92-5.266-11.92-12.32 0-7.298 5.012-12.31 12.174-12.31s11.91 4.992 12.037 12.31zM88.44 125.301h15.447l2.951-61.298H85.46l2.98 61.298zm101.932 51.733c-2.237 3.664-6.214 5.921-10.493 5.921H12.282c-4.426 0-8.51-2.384-10.698-6.233a12.34 12.34 0 0 1 .147-12.349l84.111-149.22c2.208-3.722 6.204-5.96 10.522-5.96h.332c4.445.107 8.441 2.618 10.513 6.546l83.515 149.229c1.993 3.8 1.905 8.363-.352 12.066zm-10.493-6.4L96.354 21.454l-84.062 149.18h167.587z" /></svg>';
      ui.modal = true;
      ui.autohide = false;
    }
    content = '<div class="toast-head">'.concat(icon).concat(title, '</div><div class="toast-body">').concat(body, "</div>");
    let toaster = _a.doc.getElementById("toaster");
    if (toaster === null) {
      toaster = _a.doc.createElement("div");
      toaster.id = "toaster";
      toaster.title = "Click to clear all notifcations";
      toaster.setAttribute("class", "toaster");
      toaster.setAttribute("role", "dialog");
      toaster.setAttribute("arial-label", "Toast message");
      toaster.onclick = function() {
        toaster.remove();
      };
      _a.doc.body.insertAdjacentElement("afterbegin", toaster);
    }
    const toast = _a.doc.createElement("div");
    toast.title = "Click to clear this notifcation";
    toast.setAttribute("class", "toast ".concat(ui.variant ? ui.variant : "", " ").concat(type));
    toast.innerHTML = content;
    toast.setAttribute("role", "alertdialog");
    if (ui.modal) toast.setAttribute("aria-modal", ui.modal);
    toast.onclick = function(evt) {
      evt.stopPropagation();
      toast.remove();
      if (toaster.childElementCount < 1) toaster.remove();
    };
    if (type === "alert") {
    }
    toaster.insertAdjacentElement(ui.appendToast === true ? "beforeend" : "afterbegin", toast);
    if (ui.autohide === true) {
      setInterval(() => {
        toast.remove();
        if (toaster.childElementCount < 1) toaster.remove();
      }, ui.autoHideDelay);
    }
  }
  // --- End of showDialog ---
  /** Directly manage UI via JSON
   * @param {object} json Either an object containing {_ui: {}} or simply simple {} containing ui instructions
   */
  ui(json) {
    let msg = {};
    if (json._ui) msg = json;
    else msg._ui = json;
    this._uiManager(msg);
  }
  /** Get data from the DOM. Returns selection of useful props unless a specific prop requested.
   * @param {string} cssSelector Identify the DOM element to get data from
   * @param {string} [propName] Optional. Specific name of property to get from the element
   * @returns {Array<*>} Array of objects containing either specific requested property or a selection of useful properties
   */
  uiGet(cssSelector, propName = null) {
    const selection = (
      /** @type {NodeListOf<HTMLInputElement>} */
      _a.doc.querySelectorAll(cssSelector)
    );
    const out = [];
    selection.forEach((node) => {
      if (propName) {
        if (propName === "classes") propName = "class";
        let prop = node.getAttribute(propName);
        if (prop === void 0 || prop === null) {
          try {
            prop = node[propName];
          } catch (error) {
          }
        }
        if (prop === void 0 || prop === null) {
          if (propName.toLowerCase() === "value") out.push(node.innerText);
          else out.push("Property '".concat(propName, "' not found"));
        } else {
          const p = {};
          const cType = prop.constructor.name.toLowerCase();
          if (cType === "namednodemap") {
            for (const key of prop) {
              p[key.name] = prop[key.name].value;
            }
          } else if (!cType.includes("map")) {
            p[propName] = prop;
          } else {
            const p2 = {};
            for (const key in prop) {
              p2[key] = prop[key];
            }
          }
          if (p.class) p.classes = Array.from(node.classList);
          out.push(p);
        }
      } else {
        out.push(this.nodeGet(node, cssSelector));
      }
    });
    return out;
  }
  // --- end of uiGet --- //
  /** External alias for _uiComposeComponent
   * @param {*} el HTML Element to enhance
   * @param {*} comp Individual uibuilder ui component spec
   */
  uiEnhanceElement(el, comp) {
    this._uiComposeComponent(el, comp);
  }
  //#region --- table handling ---
  /** Column metadata object definition
   * @typedef columnDefinition
   * @property {number} index The column index number
   * @property {boolean} hasName Whether the column has a defined name or not
   * @property {string} title The title of the column. Shown in the table header row
   * @property {string=} name Optional. A defined column name that will be added as the `data-col-name` to all cells in the column if defined
   * @property {string|number=} key Optional. A key value (currently unused)
   * @property {"string"|"date"|"number"|"html"=} dataType FOR FUTURE USE. Optional. What type of data will this column contain?
   * @property {boolean=} editable FOR FUTURE USE. Optional. Can cells in this column be edited?
   */
  /** Directly add a table to a parent element.
   * @param {Array<object>|Array<Array>|object} data  Input data array or object. Object of objects gives named rows. Array of objects named cols. Array of arrays no naming.
   * @param {object} [opts] Build options
   *   @param {Array<columnDefinition>=} opts.cols Column metadata. If not provided will be derived from 1st row of data
   *   @param {HTMLElement|string} opts.parent Default=body. The table will be added as a child. May be an actual HTML element or a CSS Selector
   *   @param {boolean=} opts.allowHTML Optional, default=false. If true, allows HTML cell content, otherwise only allows text. Always sanitise HTML inputs
   */
  createTable(data = [], opts = { parent: "body" }) {
    if (!opts.parent) throw new Error("[ui.js:createTable] opts.parent must be provided");
    this.buildHtmlTable(data, opts);
  }
  // TODO ...
  /** Builds & returns an HTML table element from an array (or object) of objects
   * 1st row is used for columns unless you pass opts.cols to describe them.
   * If an object of objects, inner keys are used to populate th/td `data-col-name` attribs. Outer keys applied as row ID's.
   *
   * TODO
   * - Allow optional caption, heading, footers, optional collapse
   * - Multiple headings, footers
   * - colspans, rowspans
   * - multiple tbody
   *
   * @param {Array<object>|Array<Array>|object} data Input data array or object. Object of objects gives named rows. Array of objects named cols. Array of arrays no naming.
   * @param {object} opts Table options
   *   @param {Array<columnDefinition>=} opts.cols Column metadata. If not provided will be derived from 1st row of data
   *   @param {HTMLElement|string=} opts.parent If provided, the table will be added as a child instead of returned. May be an actual HTML element or a CSS Selector
   *   @param {boolean=} opts.allowHTML Optional, default=false. If true, allows HTML cell content, otherwise only allows text. Always sanitise HTML inputs
   * @returns {HTMLTableElement|HTMLParagraphElement} Output HTML Element
   */
  buildHtmlTable(data, opts = {}) {
    let rowKeys;
    const dataType = Object.prototype.toString.apply(data);
    if (dataType === "[object Array]" || dataType === "[object Object]") {
      rowKeys = Object.keys(data);
      data = Object.values(data);
    } else {
      const out = _a.doc.createElement("p");
      out.textContent = "Input data is not an array or an object, cannot create a table.";
      return out;
    }
    if (rowKeys.length > 1e3) _a.log(1, "Uib:buildHtmlTable", "Warning, data is ".concat(rowKeys.length, " rows. Anything over 1,000 can get very slow to complete."))();
    const tbl = _a.doc.createElement("table");
    const thead = _a.doc.createElement("thead");
    const headerRow = _a.doc.createElement("tr");
    if (!opts.cols) {
      if (data.length < 1) throw new Error("[ui.js:buildHtmlTable] When no opts.cols is provided, data must contain at least 1 row");
      const hasName = Object.prototype.toString.apply(data[0]) !== "[object Array]";
      headerRow.dataset.colReference = "";
      opts.cols = [];
      Object.keys(data[0]).forEach((col, i) => {
        opts.cols.push({
          "index": i,
          "hasName": hasName,
          "name": hasName ? col : void 0,
          "key": col != null ? col : i,
          "title": col
        });
      });
    }
    tbl.cols = opts.cols;
    opts.cols.forEach((col) => {
      const thEl = _a.doc.createElement("th");
      thEl.textContent = col.title;
      if (col.hasName === true) thEl.dataset.colName = name;
      headerRow.appendChild(thEl);
    });
    thead.appendChild(headerRow);
    tbl.appendChild(thead);
    const tbody = _a.doc.createElement("tbody");
    tbl.appendChild(tbody);
    const rowOpts = {
      allowHTML: true,
      cols: opts.cols
      // we only want to get this once
    };
    data.forEach((item, i) => {
      if (isNaN(Number(rowKeys[i]))) rowOpts.rowId = rowKeys[i];
      else rowOpts.rowId = void 0;
      this.tblAddRow(tbl, item, rowOpts);
    });
    if (opts.parent) {
      let parentEl;
      if (typeof opts.parent === "string") {
        parentEl = _a.doc.querySelector(opts.parent);
      } else {
        parentEl = opts.parent;
      }
      try {
        parentEl.appendChild(tbl);
      } catch (e) {
        throw new Error("[ui.js:buildHtmlTable] Could not add table to parent. ".concat(e.message));
      }
      return;
    }
    return tbl;
  }
  /** Adds (or replaces) a single row in an existing table>tbody
   * NOTE: Row numbers use the rowIndex property of the row element.
   * @param {string|HTMLTableElement} tbl Either a CSS Selector for the table or a reference to the HTML Table Element
   * @param {object|Array} rowData A single row of column/cell data
   * @param {object} [options] Additional options
   *  @param {number=} options.body Optional, default=0. The tbody section to add the row to.
   *  @param {boolean=} options.allowHTML Optional, default=false. If true, allows HTML cell content, otherwise only allows text. Always sanitise HTML inputs
   *  @param {string=} options.rowId Optional. HTML element ID for the added row
   *  @param {number=} options.afterRow Optional. If provided, the new row will be added after this row number
   *  @param {number=} options.beforeRow Optional. If provided, the new row will be added before this row number. Ignored if afterRow is provided
   *  @param {number=} options.replaceRow Optional. If provided, the specified row will be REPLACED instead of added. Ignored if afterRow or beforeRow is provided
   *  @param {Array<columnDefinition>} [options.cols] Optional. Data about each column. If not provided, will be calculated from the table
   *
   * @returns {HTMLTableRowElement} Reference to the newly added row. Use the `rowIndex` prop for the row number
   */
  tblAddRow(tbl, rowData = {}, options = {}) {
    const tblType = Object.prototype.toString.apply(tbl);
    if (Object.prototype.toString.apply(options) !== "[object Object]") throw new Error("[tblAddDataRow] options must be an object");
    const dataType = Object.prototype.toString.apply(rowData);
    if (dataType !== "[object Object]" && dataType !== "[object Array]") throw new Error("[tblAddDataRow] rowData MUST be an object or an array containing column/cell data for each column");
    let tblEl;
    if (tblType === "[object HTMLTableElement]") {
      tblEl = tbl;
    } else {
      tblEl = _a.doc.querySelector(tbl);
      if (!tblEl) throw new Error('[tblAddDataRow] Table with CSS Selector "'.concat(tbl, '" not found'));
    }
    if (!options.body) options.body = 0;
    if (!("allowHTML" in options)) options.allowHTML = false;
    const tbodyEl = tblEl.getElementsByTagName("tbody")[options.body];
    if (!tbodyEl) throw new Error("[tblAddDataRow] Table must have a tbody tag, tbody section ".concat(options.body, " does not exist"));
    if (!options.cols) options.cols = this.tblGetColMeta(tblEl);
    const colMeta = options.cols;
    const rowEl = _a.doc.createElement("tr");
    if (options.rowId) rowEl.id = options.rowId;
    const cols = [];
    for (const col of colMeta) {
      const cellEl = _a.doc.createElement("td");
      cellEl.colMeta = col;
      if (col.hasName) cellEl.dataset.colName = col.name;
      cols.push(cellEl);
    }
    Object.keys(rowData).forEach((colKey, i, row) => {
      let foundEl = cols.find((col) => {
        var _a3;
        return ((_a3 = col == null ? void 0 : col.colMeta) == null ? void 0 : _a3.name) === colKey;
      });
      let foundRowData;
      if (foundEl) {
        foundRowData = rowData[colKey];
      } else {
        let numColKey = Number(colKey);
        if (isNaN(numColKey)) numColKey = i;
        if (numColKey <= cols.length - 1) {
          foundEl = cols[numColKey];
          foundRowData = Object.values(rowData)[numColKey];
        }
      }
      if (foundEl) {
        if (options.allowHTML) foundEl.innerHTML = this.sanitiseHTML(foundRowData);
        else foundEl.textContent = foundRowData;
      }
    });
    rowEl.append(...cols);
    if ("afterRow" in options) {
      const afterRow = tbodyEl.rows[options.afterRow];
      if (afterRow) return afterRow.after(rowEl);
    } else if ("beforeRow" in options) {
      const beforeRow = tbodyEl.rows[options.beforeRow];
      if (beforeRow) return beforeRow.before(rowEl);
    } else if ("replaceRow" in options) {
      const replaceRow = tbodyEl.rows[options.replaceRow];
      if (replaceRow) return replaceRow.replaceWith(rowEl);
    }
    return tbodyEl.appendChild(rowEl);
  }
  /** Add table event listener that returns the text or html content of either the full row or a single cell
   * NOTE: Assumes that the table has a `tbody` element.
   * If cells have a `data-col-name` attribute, it will be used in the output as the column name.
   * @example tblAddListener('#eltest-tbl-table', {}, myVar)
   * @example tblAddListener('#eltest-tbl-table', {eventScope: 'cell'}, myVar2)
   *
   * @param {string} tblSelector The table CSS Selector
   * @param {object} [options] Additional options. Default={}
   *   @param {"row"|"cell"=} options.eventScope Optional, default=row. Return data for either the whole row (as an object) or for the single cell clicked
   *   @param {"text"|"html"=} options.returnType Optional, default=text. Return text or html data
   *   @param {number=} options.pad Optional, default=3. Will be used to front-pad unnamed column references with zeros. e.g. 3 => "C002"/"C012"/"C342"
   *   @param {boolean=} options.send Optional, default=true. If uibuilder is present, will automatically send a message back to Node-RED.
   *   @param {string|number=} options.logLevel Optional, default=3/info. Numeric or string log level matching uibuilder's log levels.
   *   @param {string} [options.eventType] Optional, default=click. What event to listen for.
   * @param {object=} out A variable reference that will be updated with the output data upon a click event
   */
  tblAddListener(tblSelector, options = {}, out = {}) {
    const table = _a.doc.querySelector(tblSelector);
    if (!table) throw new Error('Table with CSS Selector "'.concat(tblSelector, '" not found'));
    if (typeof out !== "object") throw new Error('The "out" argument MUST be an object');
    if (!options.eventScope) options.eventScope = "row";
    if (!options.returnType) options.returnType = "text";
    if (!options.eventType) options.eventType = "click";
    if (!options.pad) options.pad = 3;
    if (!options.logLevel) options.logLevel = 2;
    if (!("send" in options)) options.send = true;
    table.querySelector("tbody").addEventListener(options.eventType, (event2) => {
      Object.keys(out).forEach((key) => delete out[key]);
      const clickedRow = event2.target.closest("tr");
      const clickedCell = event2.target.closest("td");
      if (clickedRow) {
        out.clickType = options.eventScope;
        out.eventType = options.eventType;
        const rowIndex = out.rowIndex = clickedRow.rowIndex;
        const cellIndex = out.cellIndex = clickedCell.cellIndex + 1;
        if (clickedRow.id) out.rowId = clickedRow.id;
        if (options.eventScope === "row") {
          clickedRow.querySelectorAll("td").forEach((cell) => {
            const colName = this.tblGetCellName(cell, options.pad);
            out[colName] = options.returnType === "text" ? cell.textContent.trim() : cell.innerHTML;
          });
        } else {
          const colName = this.tblGetCellName(clickedCell, options.pad);
          out[colName] = options.returnType === "text" ? clickedCell.textContent.trim() : clickedCell.innerHTML;
        }
        _a.log(options.logLevel, "Ui:tblAddClickListener", "".concat(options.eventScope, " ").concat(options.eventType, " on row=").concat(rowIndex, ", col=").concat(cellIndex, ", data: "), out)();
        if (options.send === true && _a.win["uibuilder"]) _a.win["uibuilder"].send({
          topic: "".concat(tblSelector, " ").concat(options.eventScope, " ").concat(options.eventType),
          payload: out
        });
      }
    });
  }
  /** Find the column definition for a single column
   * @param {string|number} rowKey Key or index to use for column search
   * @param {Array<columnDefinition>=} colMeta Array of column definitions. If not provided, will need the HTML table element.
   * @param {HTMLTableElement=} tblEl If the colMeta table not provided, provide the HTML table element to do the lookup
   * @returns {columnDefinition} Column metadata object
   */
  tblFindColMeta(rowKey, colMeta, tblEl) {
    if (!colMeta && !tblEl) throw new Error("[tblFindColMeta] Either the column metadata array or the HTML table element must be provided");
    if (!colMeta && tblEl) colMeta = this.tblGetColMeta(tblEl);
    let colDef;
    if (colMeta[rowKey]) colDef = colMeta[rowKey];
    else {
      const find = colMeta.find((c) => c.name === rowKey || c.index === Number(rowKey));
      if (find) colDef = find;
    }
    return colDef;
  }
  /** Return a standardised table cell name. Either from a `data-col-name` attribute or a numeric reference like `C003`
   * @param {HTMLTableCellElement} cellEl The cell element to process
   * @param {number=} pad Optional, default=3. Will be used to front-pad unnamed column references with zeros. e.g. 3 => "C002"/"C012"/"C342"
   * @returns {string} A cell name
   */
  tblGetCellName(cellEl, pad = 3) {
    var _a3;
    return (_a3 = cellEl.getAttribute("data-col-name")) != null ? _a3 : "C".concat(String(cellEl.cellIndex + 1).padStart(pad, "0"));
  }
  /** Returns either the existing or calculated column metadata given any table
   * First checks if the data is on the `cols` custom property of the table
   * If not, then looks 1st for a row with a `data-col-reference` attribute. Then for the first TR of the thead. Then for the first TR of the table.
   * @param {HTMLTableElement} tblEl DOM table element
   * @param {object} [options] Additional options. Default={}
   *   @param {number=} options.pad Optional, default=3. Will be used to front-pad unnamed column references with zeros. e.g. 3 => "C002"/"C012"/"C342"
   * @returns {Array<columnDefinition>} Column metadata = array of column definitions
   */
  tblGetColMeta(tblEl, options = {}) {
    var _a3, _b, _c;
    if (!options.pad) options.pad = 3;
    if (tblEl.cols) return tblEl.cols;
    let cols = (_a3 = tblEl.querySelector("tr[data-col-reference]")) == null ? void 0 : _a3.children;
    if (!cols) cols = (_b = tblEl.querySelector("thead>tr:first-of-type")) == null ? void 0 : _b.children;
    if (!cols) cols = (_c = tblEl.querySelector("tr:first-of-type")) == null ? void 0 : _c.children;
    if (!cols) {
      _a.log(1, "Ui:tblGetColMeta", "No columns found in table")();
      return [];
    }
    const colData = [];
    let cellEl;
    for (cellEl of cols) {
      const hasName = !!cellEl.dataset.colName;
      const colName = cellEl.dataset.colName;
      const colIndex = cellEl.cellIndex + 1;
      const colKey = hasName ? colName : "C".concat(String(cellEl.cellIndex + 1).padStart(options.pad, "0"));
      colData.push({
        index: colIndex,
        hasName,
        name: colName,
        key: colKey,
        title: cellEl.textContent
      });
    }
    tblEl.cols = colData;
    return colData;
  }
  /** Remove a row from an existing table
   * @param {string|HTMLTableElement} tbl Either a CSS Selector for the table or a reference to the HTML Table Element
   * @param {number} rowIndex The row number to remove (1st row is 0, last row is -1)
   * @param {object} [options] Additional options
   *  @param {number=} options.body Optional, default=0. The tbody section to add the row to.
   */
  tblRemoveRow(tbl, rowIndex, options = {}) {
    const tblType = Object.prototype.toString.apply(tbl);
    if (Object.prototype.toString.apply(options) !== "[object Object]") throw new Error("[tblRemoveRow] options must be an object");
    let tblEl;
    if (tblType === "[object HTMLTableElement]") {
      tblEl = tbl;
    } else {
      tblEl = _a.doc.querySelector(tbl);
      if (!tblEl) throw new Error('[tblRemoveRow] Table with CSS Selector "'.concat(tbl, '" not found'));
    }
    if (!options.body) options.body = 0;
    const tbodyEl = tblEl.getElementsByTagName("tbody")[options.body];
    if (!tbodyEl) throw new Error("[tblAddDataRow] Table must have a tbody tag, tbody section ".concat(options.body, " does not exist"));
    tbodyEl.deleteRow(rowIndex);
  }
  //#endregion --- table handling ---
  //#endregion ---- external methods ----
}, /** Reference to DOM window - must be passed in the constructor
 * Allows for use of this library/class with `jsdom` in Node.JS as well as the browser.
 * @type {Window}
 */
__publicField(_a, "win"), /** Reference to the DOM top-level window.document for convenience - set in constructor @type {Document} */
__publicField(_a, "doc"), /** Log function - passed in constructor or will be a dummy function
 * @type {Function}
 */
__publicField(_a, "log"), /** Options for Markdown-IT if available (set in constructor) */
__publicField(_a, "mdOpts"), /** Reference to pre-loaded Markdown-IT library */
__publicField(_a, "md"), _a);
var ui_default = Ui;

// node_modules/engine.io-parser/build/esm/commons.js
var PACKET_TYPES = /* @__PURE__ */ Object.create(null);
PACKET_TYPES["open"] = "0";
PACKET_TYPES["close"] = "1";
PACKET_TYPES["ping"] = "2";
PACKET_TYPES["pong"] = "3";
PACKET_TYPES["message"] = "4";
PACKET_TYPES["upgrade"] = "5";
PACKET_TYPES["noop"] = "6";
var PACKET_TYPES_REVERSE = /* @__PURE__ */ Object.create(null);
Object.keys(PACKET_TYPES).forEach((key) => {
  PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
});
var ERROR_PACKET = { type: "error", data: "parser error" };

// node_modules/engine.io-parser/build/esm/encodePacket.browser.js
var withNativeBlob = typeof Blob === "function" || typeof Blob !== "undefined" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]";
var withNativeArrayBuffer = typeof ArrayBuffer === "function";
var isView = (obj) => {
  return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj && obj.buffer instanceof ArrayBuffer;
};
var encodePacket = ({ type, data }, supportsBinary, callback) => {
  if (withNativeBlob && data instanceof Blob) {
    if (supportsBinary) {
      return callback(data);
    } else {
      return encodeBlobAsBase64(data, callback);
    }
  } else if (withNativeArrayBuffer && (data instanceof ArrayBuffer || isView(data))) {
    if (supportsBinary) {
      return callback(data);
    } else {
      return encodeBlobAsBase64(new Blob([data]), callback);
    }
  }
  return callback(PACKET_TYPES[type] + (data || ""));
};
var encodeBlobAsBase64 = (data, callback) => {
  const fileReader = new FileReader();
  fileReader.onload = function() {
    const content = fileReader.result.split(",")[1];
    callback("b" + (content || ""));
  };
  return fileReader.readAsDataURL(data);
};
function toArray(data) {
  if (data instanceof Uint8Array) {
    return data;
  } else if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  } else {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
}
var TEXT_ENCODER;
function encodePacketToBinary(packet, callback) {
  if (withNativeBlob && packet.data instanceof Blob) {
    return packet.data.arrayBuffer().then(toArray).then(callback);
  } else if (withNativeArrayBuffer && (packet.data instanceof ArrayBuffer || isView(packet.data))) {
    return callback(toArray(packet.data));
  }
  encodePacket(packet, false, (encoded) => {
    if (!TEXT_ENCODER) {
      TEXT_ENCODER = new TextEncoder();
    }
    callback(TEXT_ENCODER.encode(encoded));
  });
}

// node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}
var decode = (base64) => {
  let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
  if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }
  const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
  for (i = 0; i < len; i += 4) {
    encoded1 = lookup[base64.charCodeAt(i)];
    encoded2 = lookup[base64.charCodeAt(i + 1)];
    encoded3 = lookup[base64.charCodeAt(i + 2)];
    encoded4 = lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arraybuffer;
};

// node_modules/engine.io-parser/build/esm/decodePacket.browser.js
var withNativeArrayBuffer2 = typeof ArrayBuffer === "function";
var decodePacket = (encodedPacket, binaryType) => {
  if (typeof encodedPacket !== "string") {
    return {
      type: "message",
      data: mapBinary(encodedPacket, binaryType)
    };
  }
  const type = encodedPacket.charAt(0);
  if (type === "b") {
    return {
      type: "message",
      data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
    };
  }
  const packetType = PACKET_TYPES_REVERSE[type];
  if (!packetType) {
    return ERROR_PACKET;
  }
  return encodedPacket.length > 1 ? {
    type: PACKET_TYPES_REVERSE[type],
    data: encodedPacket.substring(1)
  } : {
    type: PACKET_TYPES_REVERSE[type]
  };
};
var decodeBase64Packet = (data, binaryType) => {
  if (withNativeArrayBuffer2) {
    const decoded = decode(data);
    return mapBinary(decoded, binaryType);
  } else {
    return { base64: true, data };
  }
};
var mapBinary = (data, binaryType) => {
  switch (binaryType) {
    case "blob":
      if (data instanceof Blob) {
        return data;
      } else {
        return new Blob([data]);
      }
    case "arraybuffer":
    default:
      if (data instanceof ArrayBuffer) {
        return data;
      } else {
        return data.buffer;
      }
  }
};

// node_modules/engine.io-parser/build/esm/index.js
var SEPARATOR = String.fromCharCode(30);
var encodePayload = (packets, callback) => {
  const length = packets.length;
  const encodedPackets = new Array(length);
  let count = 0;
  packets.forEach((packet, i) => {
    encodePacket(packet, false, (encodedPacket) => {
      encodedPackets[i] = encodedPacket;
      if (++count === length) {
        callback(encodedPackets.join(SEPARATOR));
      }
    });
  });
};
var decodePayload = (encodedPayload, binaryType) => {
  const encodedPackets = encodedPayload.split(SEPARATOR);
  const packets = [];
  for (let i = 0; i < encodedPackets.length; i++) {
    const decodedPacket = decodePacket(encodedPackets[i], binaryType);
    packets.push(decodedPacket);
    if (decodedPacket.type === "error") {
      break;
    }
  }
  return packets;
};
function createPacketEncoderStream() {
  return new TransformStream({
    transform(packet, controller) {
      encodePacketToBinary(packet, (encodedPacket) => {
        const payloadLength = encodedPacket.length;
        let header;
        if (payloadLength < 126) {
          header = new Uint8Array(1);
          new DataView(header.buffer).setUint8(0, payloadLength);
        } else if (payloadLength < 65536) {
          header = new Uint8Array(3);
          const view = new DataView(header.buffer);
          view.setUint8(0, 126);
          view.setUint16(1, payloadLength);
        } else {
          header = new Uint8Array(9);
          const view = new DataView(header.buffer);
          view.setUint8(0, 127);
          view.setBigUint64(1, BigInt(payloadLength));
        }
        if (packet.data && typeof packet.data !== "string") {
          header[0] |= 128;
        }
        controller.enqueue(header);
        controller.enqueue(encodedPacket);
      });
    }
  });
}
var TEXT_DECODER;
function totalLength(chunks) {
  return chunks.reduce((acc, chunk) => acc + chunk.length, 0);
}
function concatChunks(chunks, size) {
  if (chunks[0].length === size) {
    return chunks.shift();
  }
  const buffer = new Uint8Array(size);
  let j = 0;
  for (let i = 0; i < size; i++) {
    buffer[i] = chunks[0][j++];
    if (j === chunks[0].length) {
      chunks.shift();
      j = 0;
    }
  }
  if (chunks.length && j < chunks[0].length) {
    chunks[0] = chunks[0].slice(j);
  }
  return buffer;
}
function createPacketDecoderStream(maxPayload, binaryType) {
  if (!TEXT_DECODER) {
    TEXT_DECODER = new TextDecoder();
  }
  const chunks = [];
  let state = 0;
  let expectedLength = -1;
  let isBinary2 = false;
  return new TransformStream({
    transform(chunk, controller) {
      chunks.push(chunk);
      while (true) {
        if (state === 0) {
          if (totalLength(chunks) < 1) {
            break;
          }
          const header = concatChunks(chunks, 1);
          isBinary2 = (header[0] & 128) === 128;
          expectedLength = header[0] & 127;
          if (expectedLength < 126) {
            state = 3;
          } else if (expectedLength === 126) {
            state = 1;
          } else {
            state = 2;
          }
        } else if (state === 1) {
          if (totalLength(chunks) < 2) {
            break;
          }
          const headerArray = concatChunks(chunks, 2);
          expectedLength = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length).getUint16(0);
          state = 3;
        } else if (state === 2) {
          if (totalLength(chunks) < 8) {
            break;
          }
          const headerArray = concatChunks(chunks, 8);
          const view = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length);
          const n = view.getUint32(0);
          if (n > Math.pow(2, 53 - 32) - 1) {
            controller.enqueue(ERROR_PACKET);
            break;
          }
          expectedLength = n * Math.pow(2, 32) + view.getUint32(4);
          state = 3;
        } else {
          if (totalLength(chunks) < expectedLength) {
            break;
          }
          const data = concatChunks(chunks, expectedLength);
          controller.enqueue(decodePacket(isBinary2 ? data : TEXT_DECODER.decode(data), binaryType));
          state = 0;
        }
        if (expectedLength === 0 || expectedLength > maxPayload) {
          controller.enqueue(ERROR_PACKET);
          break;
        }
      }
    }
  });
}
var protocol = 4;

// node_modules/@socket.io/component-emitter/lib/esm/index.js
function Emitter(obj) {
  if (obj) return mixin(obj);
}
function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}
Emitter.prototype.on = Emitter.prototype.addEventListener = function(event2, fn) {
  this._callbacks = this._callbacks || {};
  (this._callbacks["$" + event2] = this._callbacks["$" + event2] || []).push(fn);
  return this;
};
Emitter.prototype.once = function(event2, fn) {
  function on2() {
    this.off(event2, on2);
    fn.apply(this, arguments);
  }
  on2.fn = fn;
  this.on(event2, on2);
  return this;
};
Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event2, fn) {
  this._callbacks = this._callbacks || {};
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }
  var callbacks = this._callbacks["$" + event2];
  if (!callbacks) return this;
  if (1 == arguments.length) {
    delete this._callbacks["$" + event2];
    return this;
  }
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  if (callbacks.length === 0) {
    delete this._callbacks["$" + event2];
  }
  return this;
};
Emitter.prototype.emit = function(event2) {
  this._callbacks = this._callbacks || {};
  var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event2];
  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }
  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }
  return this;
};
Emitter.prototype.emitReserved = Emitter.prototype.emit;
Emitter.prototype.listeners = function(event2) {
  this._callbacks = this._callbacks || {};
  return this._callbacks["$" + event2] || [];
};
Emitter.prototype.hasListeners = function(event2) {
  return !!this.listeners(event2).length;
};

// node_modules/engine.io-client/build/esm/globals.js
var nextTick = (() => {
  const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
  if (isPromiseAvailable) {
    return (cb) => Promise.resolve().then(cb);
  } else {
    return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
  }
})();
var globalThisShim = (() => {
  if (typeof self !== "undefined") {
    return self;
  } else if (typeof window !== "undefined") {
    return window;
  } else {
    return Function("return this")();
  }
})();
var defaultBinaryType = "arraybuffer";
function createCookieJar() {
}

// node_modules/engine.io-client/build/esm/util.js
function pick(obj, ...attr) {
  return attr.reduce((acc, k) => {
    if (obj.hasOwnProperty(k)) {
      acc[k] = obj[k];
    }
    return acc;
  }, {});
}
var NATIVE_SET_TIMEOUT = globalThisShim.setTimeout;
var NATIVE_CLEAR_TIMEOUT = globalThisShim.clearTimeout;
function installTimerFunctions(obj, opts) {
  if (opts.useNativeTimers) {
    obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
    obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
  } else {
    obj.setTimeoutFn = globalThisShim.setTimeout.bind(globalThisShim);
    obj.clearTimeoutFn = globalThisShim.clearTimeout.bind(globalThisShim);
  }
}
var BASE64_OVERHEAD = 1.33;
function byteLength(obj) {
  if (typeof obj === "string") {
    return utf8Length(obj);
  }
  return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
}
function utf8Length(str) {
  let c = 0, length = 0;
  for (let i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i);
    if (c < 128) {
      length += 1;
    } else if (c < 2048) {
      length += 2;
    } else if (c < 55296 || c >= 57344) {
      length += 3;
    } else {
      i++;
      length += 4;
    }
  }
  return length;
}
function randomString() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}

// node_modules/engine.io-client/build/esm/contrib/parseqs.js
function encode(obj) {
  let str = "";
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length)
        str += "&";
      str += encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]);
    }
  }
  return str;
}
function decode2(qs) {
  let qry = {};
  let pairs = qs.split("&");
  for (let i = 0, l = pairs.length; i < l; i++) {
    let pair = pairs[i].split("=");
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
}

// node_modules/engine.io-client/build/esm/transport.js
var TransportError = class extends Error {
  constructor(reason, description, context) {
    super(reason);
    this.description = description;
    this.context = context;
    this.type = "TransportError";
  }
};
var Transport = class extends Emitter {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(opts) {
    super();
    this.writable = false;
    installTimerFunctions(this, opts);
    this.opts = opts;
    this.query = opts.query;
    this.socket = opts.socket;
    this.supportsBinary = !opts.forceBase64;
  }
  /**
   * Emits an error.
   *
   * @param {String} reason
   * @param description
   * @param context - the error context
   * @return {Transport} for chaining
   * @protected
   */
  onError(reason, description, context) {
    super.emitReserved("error", new TransportError(reason, description, context));
    return this;
  }
  /**
   * Opens the transport.
   */
  open() {
    this.readyState = "opening";
    this.doOpen();
    return this;
  }
  /**
   * Closes the transport.
   */
  close() {
    if (this.readyState === "opening" || this.readyState === "open") {
      this.doClose();
      this.onClose();
    }
    return this;
  }
  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   */
  send(packets) {
    if (this.readyState === "open") {
      this.write(packets);
    } else {
    }
  }
  /**
   * Called upon open
   *
   * @protected
   */
  onOpen() {
    this.readyState = "open";
    this.writable = true;
    super.emitReserved("open");
  }
  /**
   * Called with data.
   *
   * @param {String} data
   * @protected
   */
  onData(data) {
    const packet = decodePacket(data, this.socket.binaryType);
    this.onPacket(packet);
  }
  /**
   * Called with a decoded packet.
   *
   * @protected
   */
  onPacket(packet) {
    super.emitReserved("packet", packet);
  }
  /**
   * Called upon close.
   *
   * @protected
   */
  onClose(details) {
    this.readyState = "closed";
    super.emitReserved("close", details);
  }
  /**
   * Pauses the transport, in order not to lose packets during an upgrade.
   *
   * @param onPause
   */
  pause(onPause) {
  }
  createUri(schema, query = {}) {
    return schema + "://" + this._hostname() + this._port() + this.opts.path + this._query(query);
  }
  _hostname() {
    const hostname = this.opts.hostname;
    return hostname.indexOf(":") === -1 ? hostname : "[" + hostname + "]";
  }
  _port() {
    if (this.opts.port && (this.opts.secure && Number(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80)) {
      return ":" + this.opts.port;
    } else {
      return "";
    }
  }
  _query(query) {
    const encodedQuery = encode(query);
    return encodedQuery.length ? "?" + encodedQuery : "";
  }
};

// node_modules/engine.io-client/build/esm/transports/polling.js
var Polling = class extends Transport {
  constructor() {
    super(...arguments);
    this._polling = false;
  }
  get name() {
    return "polling";
  }
  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @protected
   */
  doOpen() {
    this._poll();
  }
  /**
   * Pauses polling.
   *
   * @param {Function} onPause - callback upon buffers are flushed and transport is paused
   * @package
   */
  pause(onPause) {
    this.readyState = "pausing";
    const pause = () => {
      this.readyState = "paused";
      onPause();
    };
    if (this._polling || !this.writable) {
      let total = 0;
      if (this._polling) {
        total++;
        this.once("pollComplete", function() {
          --total || pause();
        });
      }
      if (!this.writable) {
        total++;
        this.once("drain", function() {
          --total || pause();
        });
      }
    } else {
      pause();
    }
  }
  /**
   * Starts polling cycle.
   *
   * @private
   */
  _poll() {
    this._polling = true;
    this.doPoll();
    this.emitReserved("poll");
  }
  /**
   * Overloads onData to detect payloads.
   *
   * @protected
   */
  onData(data) {
    const callback = (packet) => {
      if ("opening" === this.readyState && packet.type === "open") {
        this.onOpen();
      }
      if ("close" === packet.type) {
        this.onClose({ description: "transport closed by the server" });
        return false;
      }
      this.onPacket(packet);
    };
    decodePayload(data, this.socket.binaryType).forEach(callback);
    if ("closed" !== this.readyState) {
      this._polling = false;
      this.emitReserved("pollComplete");
      if ("open" === this.readyState) {
        this._poll();
      } else {
      }
    }
  }
  /**
   * For polling, send a close packet.
   *
   * @protected
   */
  doClose() {
    const close = () => {
      this.write([{ type: "close" }]);
    };
    if ("open" === this.readyState) {
      close();
    } else {
      this.once("open", close);
    }
  }
  /**
   * Writes a packets payload.
   *
   * @param {Array} packets - data packets
   * @protected
   */
  write(packets) {
    this.writable = false;
    encodePayload(packets, (data) => {
      this.doWrite(data, () => {
        this.writable = true;
        this.emitReserved("drain");
      });
    });
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const schema = this.opts.secure ? "https" : "http";
    const query = this.query || {};
    if (false !== this.opts.timestampRequests) {
      query[this.opts.timestampParam] = randomString();
    }
    if (!this.supportsBinary && !query.sid) {
      query.b64 = 1;
    }
    return this.createUri(schema, query);
  }
};

// node_modules/engine.io-client/build/esm/contrib/has-cors.js
var value = false;
try {
  value = typeof XMLHttpRequest !== "undefined" && "withCredentials" in new XMLHttpRequest();
} catch (err) {
}
var hasCORS = value;

// node_modules/engine.io-client/build/esm/transports/polling-xhr.js
function empty() {
}
var BaseXHR = class extends Polling {
  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @package
   */
  constructor(opts) {
    super(opts);
    if (typeof location !== "undefined") {
      const isSSL = "https:" === location.protocol;
      let port = location.port;
      if (!port) {
        port = isSSL ? "443" : "80";
      }
      this.xd = typeof location !== "undefined" && opts.hostname !== location.hostname || port !== opts.port;
    }
  }
  /**
   * Sends data.
   *
   * @param {String} data to send.
   * @param {Function} called upon flush.
   * @private
   */
  doWrite(data, fn) {
    const req = this.request({
      method: "POST",
      data
    });
    req.on("success", fn);
    req.on("error", (xhrStatus, context) => {
      this.onError("xhr post error", xhrStatus, context);
    });
  }
  /**
   * Starts a poll cycle.
   *
   * @private
   */
  doPoll() {
    const req = this.request();
    req.on("data", this.onData.bind(this));
    req.on("error", (xhrStatus, context) => {
      this.onError("xhr poll error", xhrStatus, context);
    });
    this.pollXhr = req;
  }
};
var Request = class _Request extends Emitter {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(createRequest, uri, opts) {
    super();
    this.createRequest = createRequest;
    installTimerFunctions(this, opts);
    this._opts = opts;
    this._method = opts.method || "GET";
    this._uri = uri;
    this._data = void 0 !== opts.data ? opts.data : null;
    this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var _a3;
    const opts = pick(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    opts.xdomain = !!this._opts.xd;
    const xhr = this._xhr = this.createRequest(opts);
    try {
      xhr.open(this._method, this._uri, true);
      try {
        if (this._opts.extraHeaders) {
          xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
          for (let i in this._opts.extraHeaders) {
            if (this._opts.extraHeaders.hasOwnProperty(i)) {
              xhr.setRequestHeader(i, this._opts.extraHeaders[i]);
            }
          }
        }
      } catch (e) {
      }
      if ("POST" === this._method) {
        try {
          xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch (e) {
        }
      }
      try {
        xhr.setRequestHeader("Accept", "*/*");
      } catch (e) {
      }
      (_a3 = this._opts.cookieJar) === null || _a3 === void 0 ? void 0 : _a3.addCookies(xhr);
      if ("withCredentials" in xhr) {
        xhr.withCredentials = this._opts.withCredentials;
      }
      if (this._opts.requestTimeout) {
        xhr.timeout = this._opts.requestTimeout;
      }
      xhr.onreadystatechange = () => {
        var _a4;
        if (xhr.readyState === 3) {
          (_a4 = this._opts.cookieJar) === null || _a4 === void 0 ? void 0 : _a4.parseCookies(
            // @ts-ignore
            xhr.getResponseHeader("set-cookie")
          );
        }
        if (4 !== xhr.readyState)
          return;
        if (200 === xhr.status || 1223 === xhr.status) {
          this._onLoad();
        } else {
          this.setTimeoutFn(() => {
            this._onError(typeof xhr.status === "number" ? xhr.status : 0);
          }, 0);
        }
      };
      xhr.send(this._data);
    } catch (e) {
      this.setTimeoutFn(() => {
        this._onError(e);
      }, 0);
      return;
    }
    if (typeof document !== "undefined") {
      this._index = _Request.requestsCount++;
      _Request.requests[this._index] = this;
    }
  }
  /**
   * Called upon error.
   *
   * @private
   */
  _onError(err) {
    this.emitReserved("error", err, this._xhr);
    this._cleanup(true);
  }
  /**
   * Cleans up house.
   *
   * @private
   */
  _cleanup(fromError) {
    if ("undefined" === typeof this._xhr || null === this._xhr) {
      return;
    }
    this._xhr.onreadystatechange = empty;
    if (fromError) {
      try {
        this._xhr.abort();
      } catch (e) {
      }
    }
    if (typeof document !== "undefined") {
      delete _Request.requests[this._index];
    }
    this._xhr = null;
  }
  /**
   * Called upon load.
   *
   * @private
   */
  _onLoad() {
    const data = this._xhr.responseText;
    if (data !== null) {
      this.emitReserved("data", data);
      this.emitReserved("success");
      this._cleanup();
    }
  }
  /**
   * Aborts the request.
   *
   * @package
   */
  abort() {
    this._cleanup();
  }
};
Request.requestsCount = 0;
Request.requests = {};
if (typeof document !== "undefined") {
  if (typeof attachEvent === "function") {
    attachEvent("onunload", unloadHandler);
  } else if (typeof addEventListener === "function") {
    const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
    addEventListener(terminationEvent, unloadHandler, false);
  }
}
function unloadHandler() {
  for (let i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}
var hasXHR2 = function() {
  const xhr = newRequest({
    xdomain: false
  });
  return xhr && xhr.responseType !== null;
}();
var XHR = class extends BaseXHR {
  constructor(opts) {
    super(opts);
    const forceBase64 = opts && opts.forceBase64;
    this.supportsBinary = hasXHR2 && !forceBase64;
  }
  request(opts = {}) {
    Object.assign(opts, { xd: this.xd }, this.opts);
    return new Request(newRequest, this.uri(), opts);
  }
};
function newRequest(opts) {
  const xdomain = opts.xdomain;
  try {
    if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) {
  }
  if (!xdomain) {
    try {
      return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch (e) {
    }
  }
}

// node_modules/engine.io-client/build/esm/transports/websocket.js
var isReactNative = typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
var BaseWS = class extends Transport {
  get name() {
    return "websocket";
  }
  doOpen() {
    const uri = this.uri();
    const protocols = this.opts.protocols;
    const opts = isReactNative ? {} : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    if (this.opts.extraHeaders) {
      opts.headers = this.opts.extraHeaders;
    }
    try {
      this.ws = this.createSocket(uri, protocols, opts);
    } catch (err) {
      return this.emitReserved("error", err);
    }
    this.ws.binaryType = this.socket.binaryType;
    this.addEventListeners();
  }
  /**
   * Adds event listeners to the socket
   *
   * @private
   */
  addEventListeners() {
    this.ws.onopen = () => {
      if (this.opts.autoUnref) {
        this.ws._socket.unref();
      }
      this.onOpen();
    };
    this.ws.onclose = (closeEvent) => this.onClose({
      description: "websocket connection closed",
      context: closeEvent
    });
    this.ws.onmessage = (ev) => this.onData(ev.data);
    this.ws.onerror = (e) => this.onError("websocket error", e);
  }
  write(packets) {
    this.writable = false;
    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i];
      const lastPacket = i === packets.length - 1;
      encodePacket(packet, this.supportsBinary, (data) => {
        try {
          this.doWrite(packet, data);
        } catch (e) {
        }
        if (lastPacket) {
          nextTick(() => {
            this.writable = true;
            this.emitReserved("drain");
          }, this.setTimeoutFn);
        }
      });
    }
  }
  doClose() {
    if (typeof this.ws !== "undefined") {
      this.ws.onerror = () => {
      };
      this.ws.close();
      this.ws = null;
    }
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const schema = this.opts.secure ? "wss" : "ws";
    const query = this.query || {};
    if (this.opts.timestampRequests) {
      query[this.opts.timestampParam] = randomString();
    }
    if (!this.supportsBinary) {
      query.b64 = 1;
    }
    return this.createUri(schema, query);
  }
};
var WebSocketCtor = globalThisShim.WebSocket || globalThisShim.MozWebSocket;
var WS = class extends BaseWS {
  createSocket(uri, protocols, opts) {
    return !isReactNative ? protocols ? new WebSocketCtor(uri, protocols) : new WebSocketCtor(uri) : new WebSocketCtor(uri, protocols, opts);
  }
  doWrite(_packet, data) {
    this.ws.send(data);
  }
};

// node_modules/engine.io-client/build/esm/transports/webtransport.js
var WT = class extends Transport {
  get name() {
    return "webtransport";
  }
  doOpen() {
    try {
      this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    } catch (err) {
      return this.emitReserved("error", err);
    }
    this._transport.closed.then(() => {
      this.onClose();
    }).catch((err) => {
      this.onError("webtransport error", err);
    });
    this._transport.ready.then(() => {
      this._transport.createBidirectionalStream().then((stream) => {
        const decoderStream = createPacketDecoderStream(Number.MAX_SAFE_INTEGER, this.socket.binaryType);
        const reader = stream.readable.pipeThrough(decoderStream).getReader();
        const encoderStream = createPacketEncoderStream();
        encoderStream.readable.pipeTo(stream.writable);
        this._writer = encoderStream.writable.getWriter();
        const read = () => {
          reader.read().then(({ done, value: value2 }) => {
            if (done) {
              return;
            }
            this.onPacket(value2);
            read();
          }).catch((err) => {
          });
        };
        read();
        const packet = { type: "open" };
        if (this.query.sid) {
          packet.data = '{"sid":"'.concat(this.query.sid, '"}');
        }
        this._writer.write(packet).then(() => this.onOpen());
      });
    });
  }
  write(packets) {
    this.writable = false;
    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i];
      const lastPacket = i === packets.length - 1;
      this._writer.write(packet).then(() => {
        if (lastPacket) {
          nextTick(() => {
            this.writable = true;
            this.emitReserved("drain");
          }, this.setTimeoutFn);
        }
      });
    }
  }
  doClose() {
    var _a3;
    (_a3 = this._transport) === null || _a3 === void 0 ? void 0 : _a3.close();
  }
};

// node_modules/engine.io-client/build/esm/transports/index.js
var transports = {
  websocket: WS,
  webtransport: WT,
  polling: XHR
};

// node_modules/engine.io-client/build/esm/contrib/parseuri.js
var re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
var parts = [
  "source",
  "protocol",
  "authority",
  "userInfo",
  "user",
  "password",
  "host",
  "port",
  "relative",
  "path",
  "directory",
  "file",
  "query",
  "anchor"
];
function parse(str) {
  if (str.length > 8e3) {
    throw "URI too long";
  }
  const src = str, b = str.indexOf("["), e = str.indexOf("]");
  if (b != -1 && e != -1) {
    str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ";") + str.substring(e, str.length);
  }
  let m = re.exec(str || ""), uri = {}, i = 14;
  while (i--) {
    uri[parts[i]] = m[i] || "";
  }
  if (b != -1 && e != -1) {
    uri.source = src;
    uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
    uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
    uri.ipv6uri = true;
  }
  uri.pathNames = pathNames(uri, uri["path"]);
  uri.queryKey = queryKey(uri, uri["query"]);
  return uri;
}
function pathNames(obj, path) {
  const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
  if (path.slice(0, 1) == "/" || path.length === 0) {
    names.splice(0, 1);
  }
  if (path.slice(-1) == "/") {
    names.splice(names.length - 1, 1);
  }
  return names;
}
function queryKey(uri, query) {
  const data = {};
  query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
    if ($1) {
      data[$1] = $2;
    }
  });
  return data;
}

// node_modules/engine.io-client/build/esm/socket.js
var withEventListeners = typeof addEventListener === "function" && typeof removeEventListener === "function";
var OFFLINE_EVENT_LISTENERS = [];
if (withEventListeners) {
  addEventListener("offline", () => {
    OFFLINE_EVENT_LISTENERS.forEach((listener) => listener());
  }, false);
}
var SocketWithoutUpgrade = class _SocketWithoutUpgrade extends Emitter {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(uri, opts) {
    super();
    this.binaryType = defaultBinaryType;
    this.writeBuffer = [];
    this._prevBufferLen = 0;
    this._pingInterval = -1;
    this._pingTimeout = -1;
    this._maxPayload = -1;
    this._pingTimeoutTime = Infinity;
    if (uri && "object" === typeof uri) {
      opts = uri;
      uri = null;
    }
    if (uri) {
      const parsedUri = parse(uri);
      opts.hostname = parsedUri.host;
      opts.secure = parsedUri.protocol === "https" || parsedUri.protocol === "wss";
      opts.port = parsedUri.port;
      if (parsedUri.query)
        opts.query = parsedUri.query;
    } else if (opts.host) {
      opts.hostname = parse(opts.host).host;
    }
    installTimerFunctions(this, opts);
    this.secure = null != opts.secure ? opts.secure : typeof location !== "undefined" && "https:" === location.protocol;
    if (opts.hostname && !opts.port) {
      opts.port = this.secure ? "443" : "80";
    }
    this.hostname = opts.hostname || (typeof location !== "undefined" ? location.hostname : "localhost");
    this.port = opts.port || (typeof location !== "undefined" && location.port ? location.port : this.secure ? "443" : "80");
    this.transports = [];
    this._transportsByName = {};
    opts.transports.forEach((t) => {
      const transportName = t.prototype.name;
      this.transports.push(transportName);
      this._transportsByName[transportName] = t;
    });
    this.opts = Object.assign({
      path: "/engine.io",
      agent: false,
      withCredentials: false,
      upgrade: true,
      timestampParam: "t",
      rememberUpgrade: false,
      addTrailingSlash: true,
      rejectUnauthorized: true,
      perMessageDeflate: {
        threshold: 1024
      },
      transportOptions: {},
      closeOnBeforeunload: false
    }, opts);
    this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : "");
    if (typeof this.opts.query === "string") {
      this.opts.query = decode2(this.opts.query);
    }
    if (withEventListeners) {
      if (this.opts.closeOnBeforeunload) {
        this._beforeunloadEventListener = () => {
          if (this.transport) {
            this.transport.removeAllListeners();
            this.transport.close();
          }
        };
        addEventListener("beforeunload", this._beforeunloadEventListener, false);
      }
      if (this.hostname !== "localhost") {
        this._offlineEventListener = () => {
          this._onClose("transport close", {
            description: "network connection lost"
          });
        };
        OFFLINE_EVENT_LISTENERS.push(this._offlineEventListener);
      }
    }
    if (this.opts.withCredentials) {
      this._cookieJar = createCookieJar();
    }
    this._open();
  }
  /**
   * Creates transport of the given type.
   *
   * @param {String} name - transport name
   * @return {Transport}
   * @private
   */
  createTransport(name2) {
    const query = Object.assign({}, this.opts.query);
    query.EIO = protocol;
    query.transport = name2;
    if (this.id)
      query.sid = this.id;
    const opts = Object.assign({}, this.opts, {
      query,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[name2]);
    return new this._transportsByName[name2](opts);
  }
  /**
   * Initializes transport to use and starts probe.
   *
   * @private
   */
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    }
    const transportName = this.opts.rememberUpgrade && _SocketWithoutUpgrade.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const transport = this.createTransport(transportName);
    transport.open();
    this.setTransport(transport);
  }
  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @private
   */
  setTransport(transport) {
    if (this.transport) {
      this.transport.removeAllListeners();
    }
    this.transport = transport;
    transport.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (reason) => this._onClose("transport close", reason));
  }
  /**
   * Called when connection is deemed open.
   *
   * @private
   */
  onOpen() {
    this.readyState = "open";
    _SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === this.transport.name;
    this.emitReserved("open");
    this.flush();
  }
  /**
   * Handles a packet.
   *
   * @private
   */
  _onPacket(packet) {
    if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
      this.emitReserved("packet", packet);
      this.emitReserved("heartbeat");
      switch (packet.type) {
        case "open":
          this.onHandshake(JSON.parse(packet.data));
          break;
        case "ping":
          this._sendPacket("pong");
          this.emitReserved("ping");
          this.emitReserved("pong");
          this._resetPingTimeout();
          break;
        case "error":
          const err = new Error("server error");
          err.code = packet.data;
          this._onError(err);
          break;
        case "message":
          this.emitReserved("data", packet.data);
          this.emitReserved("message", packet.data);
          break;
      }
    } else {
    }
  }
  /**
   * Called upon handshake completion.
   *
   * @param {Object} data - handshake obj
   * @private
   */
  onHandshake(data) {
    this.emitReserved("handshake", data);
    this.id = data.sid;
    this.transport.query.sid = data.sid;
    this._pingInterval = data.pingInterval;
    this._pingTimeout = data.pingTimeout;
    this._maxPayload = data.maxPayload;
    this.onOpen();
    if ("closed" === this.readyState)
      return;
    this._resetPingTimeout();
  }
  /**
   * Sets and resets ping timeout timer based on server pings.
   *
   * @private
   */
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const delay = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + delay;
    this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout");
    }, delay);
    if (this.opts.autoUnref) {
      this._pingTimeoutTimer.unref();
    }
  }
  /**
   * Called on `drain` event
   *
   * @private
   */
  _onDrain() {
    this.writeBuffer.splice(0, this._prevBufferLen);
    this._prevBufferLen = 0;
    if (0 === this.writeBuffer.length) {
      this.emitReserved("drain");
    } else {
      this.flush();
    }
  }
  /**
   * Flush write buffers.
   *
   * @private
   */
  flush() {
    if ("closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const packets = this._getWritablePackets();
      this.transport.send(packets);
      this._prevBufferLen = packets.length;
      this.emitReserved("flush");
    }
  }
  /**
   * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
   * long-polling)
   *
   * @private
   */
  _getWritablePackets() {
    const shouldCheckPayloadSize = this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1;
    if (!shouldCheckPayloadSize) {
      return this.writeBuffer;
    }
    let payloadSize = 1;
    for (let i = 0; i < this.writeBuffer.length; i++) {
      const data = this.writeBuffer[i].data;
      if (data) {
        payloadSize += byteLength(data);
      }
      if (i > 0 && payloadSize > this._maxPayload) {
        return this.writeBuffer.slice(0, i);
      }
      payloadSize += 2;
    }
    return this.writeBuffer;
  }
  /**
   * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
   *
   * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
   * `write()` method then the message would not be buffered by the Socket.IO client.
   *
   * @return {boolean}
   * @private
   */
  /* private */
  _hasPingExpired() {
    if (!this._pingTimeoutTime)
      return true;
    const hasExpired = Date.now() > this._pingTimeoutTime;
    if (hasExpired) {
      this._pingTimeoutTime = 0;
      nextTick(() => {
        this._onClose("ping timeout");
      }, this.setTimeoutFn);
    }
    return hasExpired;
  }
  /**
   * Sends a message.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  write(msg, options, fn) {
    this._sendPacket("message", msg, options, fn);
    return this;
  }
  /**
   * Sends a message. Alias of {@link Socket#write}.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  send(msg, options, fn) {
    this._sendPacket("message", msg, options, fn);
    return this;
  }
  /**
   * Sends a packet.
   *
   * @param {String} type: packet type.
   * @param {String} data.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @private
   */
  _sendPacket(type, data, options, fn) {
    if ("function" === typeof data) {
      fn = data;
      data = void 0;
    }
    if ("function" === typeof options) {
      fn = options;
      options = null;
    }
    if ("closing" === this.readyState || "closed" === this.readyState) {
      return;
    }
    options = options || {};
    options.compress = false !== options.compress;
    const packet = {
      type,
      data,
      options
    };
    this.emitReserved("packetCreate", packet);
    this.writeBuffer.push(packet);
    if (fn)
      this.once("flush", fn);
    this.flush();
  }
  /**
   * Closes the connection.
   */
  close() {
    const close = () => {
      this._onClose("forced close");
      this.transport.close();
    };
    const cleanupAndClose = () => {
      this.off("upgrade", cleanupAndClose);
      this.off("upgradeError", cleanupAndClose);
      close();
    };
    const waitForUpgrade = () => {
      this.once("upgrade", cleanupAndClose);
      this.once("upgradeError", cleanupAndClose);
    };
    if ("opening" === this.readyState || "open" === this.readyState) {
      this.readyState = "closing";
      if (this.writeBuffer.length) {
        this.once("drain", () => {
          if (this.upgrading) {
            waitForUpgrade();
          } else {
            close();
          }
        });
      } else if (this.upgrading) {
        waitForUpgrade();
      } else {
        close();
      }
    }
    return this;
  }
  /**
   * Called upon transport error
   *
   * @private
   */
  _onError(err) {
    _SocketWithoutUpgrade.priorWebsocketSuccess = false;
    if (this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening") {
      this.transports.shift();
      return this._open();
    }
    this.emitReserved("error", err);
    this._onClose("transport error", err);
  }
  /**
   * Called upon transport close.
   *
   * @private
   */
  _onClose(reason, description) {
    if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
      this.clearTimeoutFn(this._pingTimeoutTimer);
      this.transport.removeAllListeners("close");
      this.transport.close();
      this.transport.removeAllListeners();
      if (withEventListeners) {
        if (this._beforeunloadEventListener) {
          removeEventListener("beforeunload", this._beforeunloadEventListener, false);
        }
        if (this._offlineEventListener) {
          const i = OFFLINE_EVENT_LISTENERS.indexOf(this._offlineEventListener);
          if (i !== -1) {
            OFFLINE_EVENT_LISTENERS.splice(i, 1);
          }
        }
      }
      this.readyState = "closed";
      this.id = null;
      this.emitReserved("close", reason, description);
      this.writeBuffer = [];
      this._prevBufferLen = 0;
    }
  }
};
SocketWithoutUpgrade.protocol = protocol;
var SocketWithUpgrade = class extends SocketWithoutUpgrade {
  constructor() {
    super(...arguments);
    this._upgrades = [];
  }
  onOpen() {
    super.onOpen();
    if ("open" === this.readyState && this.opts.upgrade) {
      for (let i = 0; i < this._upgrades.length; i++) {
        this._probe(this._upgrades[i]);
      }
    }
  }
  /**
   * Probes a transport.
   *
   * @param {String} name - transport name
   * @private
   */
  _probe(name2) {
    let transport = this.createTransport(name2);
    let failed = false;
    SocketWithoutUpgrade.priorWebsocketSuccess = false;
    const onTransportOpen = () => {
      if (failed)
        return;
      transport.send([{ type: "ping", data: "probe" }]);
      transport.once("packet", (msg) => {
        if (failed)
          return;
        if ("pong" === msg.type && "probe" === msg.data) {
          this.upgrading = true;
          this.emitReserved("upgrading", transport);
          if (!transport)
            return;
          SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === transport.name;
          this.transport.pause(() => {
            if (failed)
              return;
            if ("closed" === this.readyState)
              return;
            cleanup();
            this.setTransport(transport);
            transport.send([{ type: "upgrade" }]);
            this.emitReserved("upgrade", transport);
            transport = null;
            this.upgrading = false;
            this.flush();
          });
        } else {
          const err = new Error("probe error");
          err.transport = transport.name;
          this.emitReserved("upgradeError", err);
        }
      });
    };
    function freezeTransport() {
      if (failed)
        return;
      failed = true;
      cleanup();
      transport.close();
      transport = null;
    }
    const onerror = (err) => {
      const error = new Error("probe error: " + err);
      error.transport = transport.name;
      freezeTransport();
      this.emitReserved("upgradeError", error);
    };
    function onTransportClose() {
      onerror("transport closed");
    }
    function onclose() {
      onerror("socket closed");
    }
    function onupgrade(to) {
      if (transport && to.name !== transport.name) {
        freezeTransport();
      }
    }
    const cleanup = () => {
      transport.removeListener("open", onTransportOpen);
      transport.removeListener("error", onerror);
      transport.removeListener("close", onTransportClose);
      this.off("close", onclose);
      this.off("upgrading", onupgrade);
    };
    transport.once("open", onTransportOpen);
    transport.once("error", onerror);
    transport.once("close", onTransportClose);
    this.once("close", onclose);
    this.once("upgrading", onupgrade);
    if (this._upgrades.indexOf("webtransport") !== -1 && name2 !== "webtransport") {
      this.setTimeoutFn(() => {
        if (!failed) {
          transport.open();
        }
      }, 200);
    } else {
      transport.open();
    }
  }
  onHandshake(data) {
    this._upgrades = this._filterUpgrades(data.upgrades);
    super.onHandshake(data);
  }
  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} upgrades - server upgrades
   * @private
   */
  _filterUpgrades(upgrades) {
    const filteredUpgrades = [];
    for (let i = 0; i < upgrades.length; i++) {
      if (~this.transports.indexOf(upgrades[i]))
        filteredUpgrades.push(upgrades[i]);
    }
    return filteredUpgrades;
  }
};
var Socket = class extends SocketWithUpgrade {
  constructor(uri, opts = {}) {
    const o = typeof uri === "object" ? uri : opts;
    if (!o.transports || o.transports && typeof o.transports[0] === "string") {
      o.transports = (o.transports || ["polling", "websocket", "webtransport"]).map((transportName) => transports[transportName]).filter((t) => !!t);
    }
    super(uri, o);
  }
};

// node_modules/engine.io-client/build/esm/index.js
var protocol2 = Socket.protocol;

// node_modules/socket.io-client/build/esm/url.js
function url(uri, path = "", loc) {
  let obj = uri;
  loc = loc || typeof location !== "undefined" && location;
  if (null == uri)
    uri = loc.protocol + "//" + loc.host;
  if (typeof uri === "string") {
    if ("/" === uri.charAt(0)) {
      if ("/" === uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }
    if (!/^(https?|wss?):\/\//.test(uri)) {
      if ("undefined" !== typeof loc) {
        uri = loc.protocol + "//" + uri;
      } else {
        uri = "https://" + uri;
      }
    }
    obj = parse(uri);
  }
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = "80";
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = "443";
    }
  }
  obj.path = obj.path || "/";
  const ipv6 = obj.host.indexOf(":") !== -1;
  const host = ipv6 ? "[" + obj.host + "]" : obj.host;
  obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
  obj.href = obj.protocol + "://" + host + (loc && loc.port === obj.port ? "" : ":" + obj.port);
  return obj;
}

// node_modules/socket.io-parser/build/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  Decoder: () => Decoder,
  Encoder: () => Encoder,
  PacketType: () => PacketType,
  protocol: () => protocol3
});

// node_modules/socket.io-parser/build/esm/is-binary.js
var withNativeArrayBuffer3 = typeof ArrayBuffer === "function";
var isView2 = (obj) => {
  return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj.buffer instanceof ArrayBuffer;
};
var toString = Object.prototype.toString;
var withNativeBlob2 = typeof Blob === "function" || typeof Blob !== "undefined" && toString.call(Blob) === "[object BlobConstructor]";
var withNativeFile = typeof File === "function" || typeof File !== "undefined" && toString.call(File) === "[object FileConstructor]";
function isBinary(obj) {
  return withNativeArrayBuffer3 && (obj instanceof ArrayBuffer || isView2(obj)) || withNativeBlob2 && obj instanceof Blob || withNativeFile && obj instanceof File;
}
function hasBinary(obj, toJSON) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  if (Array.isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) {
      if (hasBinary(obj[i])) {
        return true;
      }
    }
    return false;
  }
  if (isBinary(obj)) {
    return true;
  }
  if (obj.toJSON && typeof obj.toJSON === "function" && arguments.length === 1) {
    return hasBinary(obj.toJSON(), true);
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
      return true;
    }
  }
  return false;
}

// node_modules/socket.io-parser/build/esm/binary.js
function deconstructPacket(packet) {
  const buffers = [];
  const packetData = packet.data;
  const pack = packet;
  pack.data = _deconstructPacket(packetData, buffers);
  pack.attachments = buffers.length;
  return { packet: pack, buffers };
}
function _deconstructPacket(data, buffers) {
  if (!data)
    return data;
  if (isBinary(data)) {
    const placeholder = { _placeholder: true, num: buffers.length };
    buffers.push(data);
    return placeholder;
  } else if (Array.isArray(data)) {
    const newData = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      newData[i] = _deconstructPacket(data[i], buffers);
    }
    return newData;
  } else if (typeof data === "object" && !(data instanceof Date)) {
    const newData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newData[key] = _deconstructPacket(data[key], buffers);
      }
    }
    return newData;
  }
  return data;
}
function reconstructPacket(packet, buffers) {
  packet.data = _reconstructPacket(packet.data, buffers);
  delete packet.attachments;
  return packet;
}
function _reconstructPacket(data, buffers) {
  if (!data)
    return data;
  if (data && data._placeholder === true) {
    const isIndexValid = typeof data.num === "number" && data.num >= 0 && data.num < buffers.length;
    if (isIndexValid) {
      return buffers[data.num];
    } else {
      throw new Error("illegal attachments");
    }
  } else if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = _reconstructPacket(data[i], buffers);
    }
  } else if (typeof data === "object") {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        data[key] = _reconstructPacket(data[key], buffers);
      }
    }
  }
  return data;
}

// node_modules/socket.io-parser/build/esm/index.js
var RESERVED_EVENTS = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
];
var protocol3 = 5;
var PacketType;
(function(PacketType2) {
  PacketType2[PacketType2["CONNECT"] = 0] = "CONNECT";
  PacketType2[PacketType2["DISCONNECT"] = 1] = "DISCONNECT";
  PacketType2[PacketType2["EVENT"] = 2] = "EVENT";
  PacketType2[PacketType2["ACK"] = 3] = "ACK";
  PacketType2[PacketType2["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
  PacketType2[PacketType2["BINARY_EVENT"] = 5] = "BINARY_EVENT";
  PacketType2[PacketType2["BINARY_ACK"] = 6] = "BINARY_ACK";
})(PacketType || (PacketType = {}));
var Encoder = class {
  /**
   * Encoder constructor
   *
   * @param {function} replacer - custom replacer to pass down to JSON.parse
   */
  constructor(replacer) {
    this.replacer = replacer;
  }
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   */
  encode(obj) {
    if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
      if (hasBinary(obj)) {
        return this.encodeAsBinary({
          type: obj.type === PacketType.EVENT ? PacketType.BINARY_EVENT : PacketType.BINARY_ACK,
          nsp: obj.nsp,
          data: obj.data,
          id: obj.id
        });
      }
    }
    return [this.encodeAsString(obj)];
  }
  /**
   * Encode packet as string.
   */
  encodeAsString(obj) {
    let str = "" + obj.type;
    if (obj.type === PacketType.BINARY_EVENT || obj.type === PacketType.BINARY_ACK) {
      str += obj.attachments + "-";
    }
    if (obj.nsp && "/" !== obj.nsp) {
      str += obj.nsp + ",";
    }
    if (null != obj.id) {
      str += obj.id;
    }
    if (null != obj.data) {
      str += JSON.stringify(obj.data, this.replacer);
    }
    return str;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(obj) {
    const deconstruction = deconstructPacket(obj);
    const pack = this.encodeAsString(deconstruction.packet);
    const buffers = deconstruction.buffers;
    buffers.unshift(pack);
    return buffers;
  }
};
function isObject(value2) {
  return Object.prototype.toString.call(value2) === "[object Object]";
}
var Decoder = class _Decoder extends Emitter {
  /**
   * Decoder constructor
   *
   * @param {function} reviver - custom reviver to pass down to JSON.stringify
   */
  constructor(reviver) {
    super();
    this.reviver = reviver;
  }
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   */
  add(obj) {
    let packet;
    if (typeof obj === "string") {
      if (this.reconstructor) {
        throw new Error("got plaintext data when reconstructing a packet");
      }
      packet = this.decodeString(obj);
      const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
      if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
        packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
        this.reconstructor = new BinaryReconstructor(packet);
        if (packet.attachments === 0) {
          super.emitReserved("decoded", packet);
        }
      } else {
        super.emitReserved("decoded", packet);
      }
    } else if (isBinary(obj) || obj.base64) {
      if (!this.reconstructor) {
        throw new Error("got binary data when not reconstructing a packet");
      } else {
        packet = this.reconstructor.takeBinaryData(obj);
        if (packet) {
          this.reconstructor = null;
          super.emitReserved("decoded", packet);
        }
      }
    } else {
      throw new Error("Unknown type: " + obj);
    }
  }
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   */
  decodeString(str) {
    let i = 0;
    const p = {
      type: Number(str.charAt(0))
    };
    if (PacketType[p.type] === void 0) {
      throw new Error("unknown packet type " + p.type);
    }
    if (p.type === PacketType.BINARY_EVENT || p.type === PacketType.BINARY_ACK) {
      const start = i + 1;
      while (str.charAt(++i) !== "-" && i != str.length) {
      }
      const buf = str.substring(start, i);
      if (buf != Number(buf) || str.charAt(i) !== "-") {
        throw new Error("Illegal attachments");
      }
      p.attachments = Number(buf);
    }
    if ("/" === str.charAt(i + 1)) {
      const start = i + 1;
      while (++i) {
        const c = str.charAt(i);
        if ("," === c)
          break;
        if (i === str.length)
          break;
      }
      p.nsp = str.substring(start, i);
    } else {
      p.nsp = "/";
    }
    const next = str.charAt(i + 1);
    if ("" !== next && Number(next) == next) {
      const start = i + 1;
      while (++i) {
        const c = str.charAt(i);
        if (null == c || Number(c) != c) {
          --i;
          break;
        }
        if (i === str.length)
          break;
      }
      p.id = Number(str.substring(start, i + 1));
    }
    if (str.charAt(++i)) {
      const payload = this.tryParse(str.substr(i));
      if (_Decoder.isPayloadValid(p.type, payload)) {
        p.data = payload;
      } else {
        throw new Error("invalid payload");
      }
    }
    return p;
  }
  tryParse(str) {
    try {
      return JSON.parse(str, this.reviver);
    } catch (e) {
      return false;
    }
  }
  static isPayloadValid(type, payload) {
    switch (type) {
      case PacketType.CONNECT:
        return isObject(payload);
      case PacketType.DISCONNECT:
        return payload === void 0;
      case PacketType.CONNECT_ERROR:
        return typeof payload === "string" || isObject(payload);
      case PacketType.EVENT:
      case PacketType.BINARY_EVENT:
        return Array.isArray(payload) && (typeof payload[0] === "number" || typeof payload[0] === "string" && RESERVED_EVENTS.indexOf(payload[0]) === -1);
      case PacketType.ACK:
      case PacketType.BINARY_ACK:
        return Array.isArray(payload);
    }
  }
  /**
   * Deallocates a parser's resources
   */
  destroy() {
    if (this.reconstructor) {
      this.reconstructor.finishedReconstruction();
      this.reconstructor = null;
    }
  }
};
var BinaryReconstructor = class {
  constructor(packet) {
    this.packet = packet;
    this.buffers = [];
    this.reconPack = packet;
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   */
  takeBinaryData(binData) {
    this.buffers.push(binData);
    if (this.buffers.length === this.reconPack.attachments) {
      const packet = reconstructPacket(this.reconPack, this.buffers);
      this.finishedReconstruction();
      return packet;
    }
    return null;
  }
  /**
   * Cleans up binary packet reconstruction variables.
   */
  finishedReconstruction() {
    this.reconPack = null;
    this.buffers = [];
  }
};

// node_modules/socket.io-client/build/esm/on.js
function on(obj, ev, fn) {
  obj.on(ev, fn);
  return function subDestroy() {
    obj.off(ev, fn);
  };
}

// node_modules/socket.io-client/build/esm/socket.js
var RESERVED_EVENTS2 = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
var Socket2 = class extends Emitter {
  /**
   * `Socket` constructor.
   */
  constructor(io, nsp, opts) {
    super();
    this.connected = false;
    this.recovered = false;
    this.receiveBuffer = [];
    this.sendBuffer = [];
    this._queue = [];
    this._queueSeq = 0;
    this.ids = 0;
    this.acks = {};
    this.flags = {};
    this.io = io;
    this.nsp = nsp;
    if (opts && opts.auth) {
      this.auth = opts.auth;
    }
    this._opts = Object.assign({}, opts);
    if (this.io._autoConnect)
      this.open();
  }
  /**
   * Whether the socket is currently disconnected
   *
   * @example
   * const socket = io();
   *
   * socket.on("connect", () => {
   *   console.log(socket.disconnected); // false
   * });
   *
   * socket.on("disconnect", () => {
   *   console.log(socket.disconnected); // true
   * });
   */
  get disconnected() {
    return !this.connected;
  }
  /**
   * Subscribe to open, close and packet events
   *
   * @private
   */
  subEvents() {
    if (this.subs)
      return;
    const io = this.io;
    this.subs = [
      on(io, "open", this.onopen.bind(this)),
      on(io, "packet", this.onpacket.bind(this)),
      on(io, "error", this.onerror.bind(this)),
      on(io, "close", this.onclose.bind(this))
    ];
  }
  /**
   * Whether the Socket will try to reconnect when its Manager connects or reconnects.
   *
   * @example
   * const socket = io();
   *
   * console.log(socket.active); // true
   *
   * socket.on("disconnect", (reason) => {
   *   if (reason === "io server disconnect") {
   *     // the disconnection was initiated by the server, you need to manually reconnect
   *     console.log(socket.active); // false
   *   }
   *   // else the socket will automatically try to reconnect
   *   console.log(socket.active); // true
   * });
   */
  get active() {
    return !!this.subs;
  }
  /**
   * "Opens" the socket.
   *
   * @example
   * const socket = io({
   *   autoConnect: false
   * });
   *
   * socket.connect();
   */
  connect() {
    if (this.connected)
      return this;
    this.subEvents();
    if (!this.io["_reconnecting"])
      this.io.open();
    if ("open" === this.io._readyState)
      this.onopen();
    return this;
  }
  /**
   * Alias for {@link connect()}.
   */
  open() {
    return this.connect();
  }
  /**
   * Sends a `message` event.
   *
   * This method mimics the WebSocket.send() method.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
   *
   * @example
   * socket.send("hello");
   *
   * // this is equivalent to
   * socket.emit("message", "hello");
   *
   * @return self
   */
  send(...args) {
    args.unshift("message");
    this.emit.apply(this, args);
    return this;
  }
  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @example
   * socket.emit("hello", "world");
   *
   * // all serializable datastructures are supported (no need to call JSON.stringify)
   * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
   *
   * // with an acknowledgement from the server
   * socket.emit("hello", "world", (val) => {
   *   // ...
   * });
   *
   * @return self
   */
  emit(ev, ...args) {
    var _a3, _b, _c;
    if (RESERVED_EVENTS2.hasOwnProperty(ev)) {
      throw new Error('"' + ev.toString() + '" is a reserved event name');
    }
    args.unshift(ev);
    if (this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) {
      this._addToQueue(args);
      return this;
    }
    const packet = {
      type: PacketType.EVENT,
      data: args
    };
    packet.options = {};
    packet.options.compress = this.flags.compress !== false;
    if ("function" === typeof args[args.length - 1]) {
      const id = this.ids++;
      const ack = args.pop();
      this._registerAckCallback(id, ack);
      packet.id = id;
    }
    const isTransportWritable = (_b = (_a3 = this.io.engine) === null || _a3 === void 0 ? void 0 : _a3.transport) === null || _b === void 0 ? void 0 : _b.writable;
    const isConnected = this.connected && !((_c = this.io.engine) === null || _c === void 0 ? void 0 : _c._hasPingExpired());
    const discardPacket = this.flags.volatile && !isTransportWritable;
    if (discardPacket) {
    } else if (isConnected) {
      this.notifyOutgoingListeners(packet);
      this.packet(packet);
    } else {
      this.sendBuffer.push(packet);
    }
    this.flags = {};
    return this;
  }
  /**
   * @private
   */
  _registerAckCallback(id, ack) {
    var _a3;
    const timeout = (_a3 = this.flags.timeout) !== null && _a3 !== void 0 ? _a3 : this._opts.ackTimeout;
    if (timeout === void 0) {
      this.acks[id] = ack;
      return;
    }
    const timer = this.io.setTimeoutFn(() => {
      delete this.acks[id];
      for (let i = 0; i < this.sendBuffer.length; i++) {
        if (this.sendBuffer[i].id === id) {
          this.sendBuffer.splice(i, 1);
        }
      }
      ack.call(this, new Error("operation has timed out"));
    }, timeout);
    const fn = (...args) => {
      this.io.clearTimeoutFn(timer);
      ack.apply(this, args);
    };
    fn.withError = true;
    this.acks[id] = fn;
  }
  /**
   * Emits an event and waits for an acknowledgement
   *
   * @example
   * // without timeout
   * const response = await socket.emitWithAck("hello", "world");
   *
   * // with a specific timeout
   * try {
   *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
   * } catch (err) {
   *   // the server did not acknowledge the event in the given delay
   * }
   *
   * @return a Promise that will be fulfilled when the server acknowledges the event
   */
  emitWithAck(ev, ...args) {
    return new Promise((resolve, reject) => {
      const fn = (arg1, arg2) => {
        return arg1 ? reject(arg1) : resolve(arg2);
      };
      fn.withError = true;
      args.push(fn);
      this.emit(ev, ...args);
    });
  }
  /**
   * Add the packet to the queue.
   * @param args
   * @private
   */
  _addToQueue(args) {
    let ack;
    if (typeof args[args.length - 1] === "function") {
      ack = args.pop();
    }
    const packet = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: false,
      args,
      flags: Object.assign({ fromQueue: true }, this.flags)
    };
    args.push((err, ...responseArgs) => {
      if (packet !== this._queue[0]) {
        return;
      }
      const hasError = err !== null;
      if (hasError) {
        if (packet.tryCount > this._opts.retries) {
          this._queue.shift();
          if (ack) {
            ack(err);
          }
        }
      } else {
        this._queue.shift();
        if (ack) {
          ack(null, ...responseArgs);
        }
      }
      packet.pending = false;
      return this._drainQueue();
    });
    this._queue.push(packet);
    this._drainQueue();
  }
  /**
   * Send the first packet of the queue, and wait for an acknowledgement from the server.
   * @param force - whether to resend a packet that has not been acknowledged yet
   *
   * @private
   */
  _drainQueue(force = false) {
    if (!this.connected || this._queue.length === 0) {
      return;
    }
    const packet = this._queue[0];
    if (packet.pending && !force) {
      return;
    }
    packet.pending = true;
    packet.tryCount++;
    this.flags = packet.flags;
    this.emit.apply(this, packet.args);
  }
  /**
   * Sends a packet.
   *
   * @param packet
   * @private
   */
  packet(packet) {
    packet.nsp = this.nsp;
    this.io._packet(packet);
  }
  /**
   * Called upon engine `open`.
   *
   * @private
   */
  onopen() {
    if (typeof this.auth == "function") {
      this.auth((data) => {
        this._sendConnectPacket(data);
      });
    } else {
      this._sendConnectPacket(this.auth);
    }
  }
  /**
   * Sends a CONNECT packet to initiate the Socket.IO session.
   *
   * @param data
   * @private
   */
  _sendConnectPacket(data) {
    this.packet({
      type: PacketType.CONNECT,
      data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, data) : data
    });
  }
  /**
   * Called upon engine or manager `error`.
   *
   * @param err
   * @private
   */
  onerror(err) {
    if (!this.connected) {
      this.emitReserved("connect_error", err);
    }
  }
  /**
   * Called upon engine `close`.
   *
   * @param reason
   * @param description
   * @private
   */
  onclose(reason, description) {
    this.connected = false;
    delete this.id;
    this.emitReserved("disconnect", reason, description);
    this._clearAcks();
  }
  /**
   * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
   * the server.
   *
   * @private
   */
  _clearAcks() {
    Object.keys(this.acks).forEach((id) => {
      const isBuffered = this.sendBuffer.some((packet) => String(packet.id) === id);
      if (!isBuffered) {
        const ack = this.acks[id];
        delete this.acks[id];
        if (ack.withError) {
          ack.call(this, new Error("socket has been disconnected"));
        }
      }
    });
  }
  /**
   * Called with socket packet.
   *
   * @param packet
   * @private
   */
  onpacket(packet) {
    const sameNamespace = packet.nsp === this.nsp;
    if (!sameNamespace)
      return;
    switch (packet.type) {
      case PacketType.CONNECT:
        if (packet.data && packet.data.sid) {
          this.onconnect(packet.data.sid, packet.data.pid);
        } else {
          this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
        }
        break;
      case PacketType.EVENT:
      case PacketType.BINARY_EVENT:
        this.onevent(packet);
        break;
      case PacketType.ACK:
      case PacketType.BINARY_ACK:
        this.onack(packet);
        break;
      case PacketType.DISCONNECT:
        this.ondisconnect();
        break;
      case PacketType.CONNECT_ERROR:
        this.destroy();
        const err = new Error(packet.data.message);
        err.data = packet.data.data;
        this.emitReserved("connect_error", err);
        break;
    }
  }
  /**
   * Called upon a server event.
   *
   * @param packet
   * @private
   */
  onevent(packet) {
    const args = packet.data || [];
    if (null != packet.id) {
      args.push(this.ack(packet.id));
    }
    if (this.connected) {
      this.emitEvent(args);
    } else {
      this.receiveBuffer.push(Object.freeze(args));
    }
  }
  emitEvent(args) {
    if (this._anyListeners && this._anyListeners.length) {
      const listeners = this._anyListeners.slice();
      for (const listener of listeners) {
        listener.apply(this, args);
      }
    }
    super.emit.apply(this, args);
    if (this._pid && args.length && typeof args[args.length - 1] === "string") {
      this._lastOffset = args[args.length - 1];
    }
  }
  /**
   * Produces an ack callback to emit with an event.
   *
   * @private
   */
  ack(id) {
    const self2 = this;
    let sent = false;
    return function(...args) {
      if (sent)
        return;
      sent = true;
      self2.packet({
        type: PacketType.ACK,
        id,
        data: args
      });
    };
  }
  /**
   * Called upon a server acknowledgement.
   *
   * @param packet
   * @private
   */
  onack(packet) {
    const ack = this.acks[packet.id];
    if (typeof ack !== "function") {
      return;
    }
    delete this.acks[packet.id];
    if (ack.withError) {
      packet.data.unshift(null);
    }
    ack.apply(this, packet.data);
  }
  /**
   * Called upon server connect.
   *
   * @private
   */
  onconnect(id, pid) {
    this.id = id;
    this.recovered = pid && this._pid === pid;
    this._pid = pid;
    this.connected = true;
    this.emitBuffered();
    this.emitReserved("connect");
    this._drainQueue(true);
  }
  /**
   * Emit buffered events (received and emitted).
   *
   * @private
   */
  emitBuffered() {
    this.receiveBuffer.forEach((args) => this.emitEvent(args));
    this.receiveBuffer = [];
    this.sendBuffer.forEach((packet) => {
      this.notifyOutgoingListeners(packet);
      this.packet(packet);
    });
    this.sendBuffer = [];
  }
  /**
   * Called upon server disconnect.
   *
   * @private
   */
  ondisconnect() {
    this.destroy();
    this.onclose("io server disconnect");
  }
  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @private
   */
  destroy() {
    if (this.subs) {
      this.subs.forEach((subDestroy) => subDestroy());
      this.subs = void 0;
    }
    this.io["_destroy"](this);
  }
  /**
   * Disconnects the socket manually. In that case, the socket will not try to reconnect.
   *
   * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
   *
   * @example
   * const socket = io();
   *
   * socket.on("disconnect", (reason) => {
   *   // console.log(reason); prints "io client disconnect"
   * });
   *
   * socket.disconnect();
   *
   * @return self
   */
  disconnect() {
    if (this.connected) {
      this.packet({ type: PacketType.DISCONNECT });
    }
    this.destroy();
    if (this.connected) {
      this.onclose("io client disconnect");
    }
    return this;
  }
  /**
   * Alias for {@link disconnect()}.
   *
   * @return self
   */
  close() {
    return this.disconnect();
  }
  /**
   * Sets the compress flag.
   *
   * @example
   * socket.compress(false).emit("hello");
   *
   * @param compress - if `true`, compresses the sending data
   * @return self
   */
  compress(compress) {
    this.flags.compress = compress;
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
   * ready to send messages.
   *
   * @example
   * socket.volatile.emit("hello"); // the server may or may not receive it
   *
   * @returns self
   */
  get volatile() {
    this.flags.volatile = true;
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
   * given number of milliseconds have elapsed without an acknowledgement from the server:
   *
   * @example
   * socket.timeout(5000).emit("my-event", (err) => {
   *   if (err) {
   *     // the server did not acknowledge the event in the given delay
   *   }
   * });
   *
   * @returns self
   */
  timeout(timeout) {
    this.flags.timeout = timeout;
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * @example
   * socket.onAny((event, ...args) => {
   *   console.log(`got ${event}`);
   * });
   *
   * @param listener
   */
  onAny(listener) {
    this._anyListeners = this._anyListeners || [];
    this._anyListeners.push(listener);
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * @example
   * socket.prependAny((event, ...args) => {
   *   console.log(`got event ${event}`);
   * });
   *
   * @param listener
   */
  prependAny(listener) {
    this._anyListeners = this._anyListeners || [];
    this._anyListeners.unshift(listener);
    return this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`got event ${event}`);
   * }
   *
   * socket.onAny(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAny(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAny();
   *
   * @param listener
   */
  offAny(listener) {
    if (!this._anyListeners) {
      return this;
    }
    if (listener) {
      const listeners = this._anyListeners;
      for (let i = 0; i < listeners.length; i++) {
        if (listener === listeners[i]) {
          listeners.splice(i, 1);
          return this;
        }
      }
    } else {
      this._anyListeners = [];
    }
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAny() {
    return this._anyListeners || [];
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.onAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  onAnyOutgoing(listener) {
    this._anyOutgoingListeners = this._anyOutgoingListeners || [];
    this._anyOutgoingListeners.push(listener);
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.prependAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  prependAnyOutgoing(listener) {
    this._anyOutgoingListeners = this._anyOutgoingListeners || [];
    this._anyOutgoingListeners.unshift(listener);
    return this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`sent event ${event}`);
   * }
   *
   * socket.onAnyOutgoing(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAnyOutgoing(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAnyOutgoing();
   *
   * @param [listener] - the catch-all listener (optional)
   */
  offAnyOutgoing(listener) {
    if (!this._anyOutgoingListeners) {
      return this;
    }
    if (listener) {
      const listeners = this._anyOutgoingListeners;
      for (let i = 0; i < listeners.length; i++) {
        if (listener === listeners[i]) {
          listeners.splice(i, 1);
          return this;
        }
      }
    } else {
      this._anyOutgoingListeners = [];
    }
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  /**
   * Notify the listeners for each packet sent
   *
   * @param packet
   *
   * @private
   */
  notifyOutgoingListeners(packet) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const listeners = this._anyOutgoingListeners.slice();
      for (const listener of listeners) {
        listener.apply(this, packet.data);
      }
    }
  }
};

// node_modules/socket.io-client/build/esm/contrib/backo2.js
function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 1e4;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}
Backoff.prototype.duration = function() {
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand = Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};
Backoff.prototype.reset = function() {
  this.attempts = 0;
};
Backoff.prototype.setMin = function(min) {
  this.ms = min;
};
Backoff.prototype.setMax = function(max) {
  this.max = max;
};
Backoff.prototype.setJitter = function(jitter) {
  this.jitter = jitter;
};

// node_modules/socket.io-client/build/esm/manager.js
var Manager = class extends Emitter {
  constructor(uri, opts) {
    var _a3;
    super();
    this.nsps = {};
    this.subs = [];
    if (uri && "object" === typeof uri) {
      opts = uri;
      uri = void 0;
    }
    opts = opts || {};
    opts.path = opts.path || "/socket.io";
    this.opts = opts;
    installTimerFunctions(this, opts);
    this.reconnection(opts.reconnection !== false);
    this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
    this.reconnectionDelay(opts.reconnectionDelay || 1e3);
    this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3);
    this.randomizationFactor((_a3 = opts.randomizationFactor) !== null && _a3 !== void 0 ? _a3 : 0.5);
    this.backoff = new Backoff({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    });
    this.timeout(null == opts.timeout ? 2e4 : opts.timeout);
    this._readyState = "closed";
    this.uri = uri;
    const _parser = opts.parser || esm_exports;
    this.encoder = new _parser.Encoder();
    this.decoder = new _parser.Decoder();
    this._autoConnect = opts.autoConnect !== false;
    if (this._autoConnect)
      this.open();
  }
  reconnection(v) {
    if (!arguments.length)
      return this._reconnection;
    this._reconnection = !!v;
    if (!v) {
      this.skipReconnect = true;
    }
    return this;
  }
  reconnectionAttempts(v) {
    if (v === void 0)
      return this._reconnectionAttempts;
    this._reconnectionAttempts = v;
    return this;
  }
  reconnectionDelay(v) {
    var _a3;
    if (v === void 0)
      return this._reconnectionDelay;
    this._reconnectionDelay = v;
    (_a3 = this.backoff) === null || _a3 === void 0 ? void 0 : _a3.setMin(v);
    return this;
  }
  randomizationFactor(v) {
    var _a3;
    if (v === void 0)
      return this._randomizationFactor;
    this._randomizationFactor = v;
    (_a3 = this.backoff) === null || _a3 === void 0 ? void 0 : _a3.setJitter(v);
    return this;
  }
  reconnectionDelayMax(v) {
    var _a3;
    if (v === void 0)
      return this._reconnectionDelayMax;
    this._reconnectionDelayMax = v;
    (_a3 = this.backoff) === null || _a3 === void 0 ? void 0 : _a3.setMax(v);
    return this;
  }
  timeout(v) {
    if (!arguments.length)
      return this._timeout;
    this._timeout = v;
    return this;
  }
  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @private
   */
  maybeReconnectOnOpen() {
    if (!this._reconnecting && this._reconnection && this.backoff.attempts === 0) {
      this.reconnect();
    }
  }
  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} fn - optional, callback
   * @return self
   * @public
   */
  open(fn) {
    if (~this._readyState.indexOf("open"))
      return this;
    this.engine = new Socket(this.uri, this.opts);
    const socket = this.engine;
    const self2 = this;
    this._readyState = "opening";
    this.skipReconnect = false;
    const openSubDestroy = on(socket, "open", function() {
      self2.onopen();
      fn && fn();
    });
    const onError = (err) => {
      this.cleanup();
      this._readyState = "closed";
      this.emitReserved("error", err);
      if (fn) {
        fn(err);
      } else {
        this.maybeReconnectOnOpen();
      }
    };
    const errorSub = on(socket, "error", onError);
    if (false !== this._timeout) {
      const timeout = this._timeout;
      const timer = this.setTimeoutFn(() => {
        openSubDestroy();
        onError(new Error("timeout"));
        socket.close();
      }, timeout);
      if (this.opts.autoUnref) {
        timer.unref();
      }
      this.subs.push(() => {
        this.clearTimeoutFn(timer);
      });
    }
    this.subs.push(openSubDestroy);
    this.subs.push(errorSub);
    return this;
  }
  /**
   * Alias for open()
   *
   * @return self
   * @public
   */
  connect(fn) {
    return this.open(fn);
  }
  /**
   * Called upon transport open.
   *
   * @private
   */
  onopen() {
    this.cleanup();
    this._readyState = "open";
    this.emitReserved("open");
    const socket = this.engine;
    this.subs.push(
      on(socket, "ping", this.onping.bind(this)),
      on(socket, "data", this.ondata.bind(this)),
      on(socket, "error", this.onerror.bind(this)),
      on(socket, "close", this.onclose.bind(this)),
      // @ts-ignore
      on(this.decoder, "decoded", this.ondecoded.bind(this))
    );
  }
  /**
   * Called upon a ping.
   *
   * @private
   */
  onping() {
    this.emitReserved("ping");
  }
  /**
   * Called with data.
   *
   * @private
   */
  ondata(data) {
    try {
      this.decoder.add(data);
    } catch (e) {
      this.onclose("parse error", e);
    }
  }
  /**
   * Called when parser fully decodes a packet.
   *
   * @private
   */
  ondecoded(packet) {
    nextTick(() => {
      this.emitReserved("packet", packet);
    }, this.setTimeoutFn);
  }
  /**
   * Called upon socket error.
   *
   * @private
   */
  onerror(err) {
    this.emitReserved("error", err);
  }
  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @public
   */
  socket(nsp, opts) {
    let socket = this.nsps[nsp];
    if (!socket) {
      socket = new Socket2(this, nsp, opts);
      this.nsps[nsp] = socket;
    } else if (this._autoConnect && !socket.active) {
      socket.connect();
    }
    return socket;
  }
  /**
   * Called upon a socket close.
   *
   * @param socket
   * @private
   */
  _destroy(socket) {
    const nsps = Object.keys(this.nsps);
    for (const nsp of nsps) {
      const socket2 = this.nsps[nsp];
      if (socket2.active) {
        return;
      }
    }
    this._close();
  }
  /**
   * Writes a packet.
   *
   * @param packet
   * @private
   */
  _packet(packet) {
    const encodedPackets = this.encoder.encode(packet);
    for (let i = 0; i < encodedPackets.length; i++) {
      this.engine.write(encodedPackets[i], packet.options);
    }
  }
  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @private
   */
  cleanup() {
    this.subs.forEach((subDestroy) => subDestroy());
    this.subs.length = 0;
    this.decoder.destroy();
  }
  /**
   * Close the current socket.
   *
   * @private
   */
  _close() {
    this.skipReconnect = true;
    this._reconnecting = false;
    this.onclose("forced close");
  }
  /**
   * Alias for close()
   *
   * @private
   */
  disconnect() {
    return this._close();
  }
  /**
   * Called when:
   *
   * - the low-level engine is closed
   * - the parser encountered a badly formatted packet
   * - all sockets are disconnected
   *
   * @private
   */
  onclose(reason, description) {
    var _a3;
    this.cleanup();
    (_a3 = this.engine) === null || _a3 === void 0 ? void 0 : _a3.close();
    this.backoff.reset();
    this._readyState = "closed";
    this.emitReserved("close", reason, description);
    if (this._reconnection && !this.skipReconnect) {
      this.reconnect();
    }
  }
  /**
   * Attempt a reconnection.
   *
   * @private
   */
  reconnect() {
    if (this._reconnecting || this.skipReconnect)
      return this;
    const self2 = this;
    if (this.backoff.attempts >= this._reconnectionAttempts) {
      this.backoff.reset();
      this.emitReserved("reconnect_failed");
      this._reconnecting = false;
    } else {
      const delay = this.backoff.duration();
      this._reconnecting = true;
      const timer = this.setTimeoutFn(() => {
        if (self2.skipReconnect)
          return;
        this.emitReserved("reconnect_attempt", self2.backoff.attempts);
        if (self2.skipReconnect)
          return;
        self2.open((err) => {
          if (err) {
            self2._reconnecting = false;
            self2.reconnect();
            this.emitReserved("reconnect_error", err);
          } else {
            self2.onreconnect();
          }
        });
      }, delay);
      if (this.opts.autoUnref) {
        timer.unref();
      }
      this.subs.push(() => {
        this.clearTimeoutFn(timer);
      });
    }
  }
  /**
   * Called upon successful reconnect.
   *
   * @private
   */
  onreconnect() {
    const attempt = this.backoff.attempts;
    this._reconnecting = false;
    this.backoff.reset();
    this.emitReserved("reconnect", attempt);
  }
};

// node_modules/socket.io-client/build/esm/index.js
var cache = {};
function lookup2(uri, opts) {
  if (typeof uri === "object") {
    opts = uri;
    uri = void 0;
  }
  opts = opts || {};
  const parsed = url(uri, opts.path || "/socket.io");
  const source = parsed.source;
  const id = parsed.id;
  const path = parsed.path;
  const sameNamespace = cache[id] && path in cache[id]["nsps"];
  const newConnection = opts.forceNew || opts["force new connection"] || false === opts.multiplex || sameNamespace;
  let io;
  if (newConnection) {
    io = new Manager(source, opts);
  } else {
    if (!cache[id]) {
      cache[id] = new Manager(source, opts);
    }
    io = cache[id];
  }
  if (parsed.query && !opts.query) {
    opts.query = parsed.queryKey;
  }
  return io.socket(parsed.path, opts);
}
Object.assign(lookup2, {
  Manager,
  Socket: Socket2,
  io: lookup2,
  connect: lookup2
});

// src/components/ti-base-component.js
var _TiBaseComponent = class _TiBaseComponent extends HTMLElement {
  /** NB: Attributes not available here - use connectedCallback to reference */
  constructor() {
    super();
    /** Is UIBUILDER for Node-RED loaded? */
    __publicField(this, "uib", !!window["uibuilder"]);
    __publicField(this, "uibuilder", window["uibuilder"]);
    /** Mini jQuery-like shadow dom selector (see constructor)
     * @type {function(string): Element}
     * @param {string} selector - A CSS selector to match the element within the shadow DOM.
     * @returns {Element} The first element that matches the specified selector.
     */
    __publicField(this, "$");
    /** Mini jQuery-like shadow dom multi-selector (see constructor)
     * @type {function(string): NodeList}
     * @param {string} selector - A CSS selector to match the element within the shadow DOM.
     * @returns {NodeList} A STATIC list of all shadow dom elements that match the selector.
     */
    __publicField(this, "$$");
    /** True when instance finishes connecting.
     * Allows initial calls of attributeChangedCallback to be
     * ignored if needed. */
    __publicField(this, "connected", false);
    /** Placeholder for the optional name attribute @type {string} */
    __publicField(this, "name");
    /** Runtime configuration settings @type {object} */
    __publicField(this, "opts", {});
  }
  /** Report the current component version string */
  static get version() {
    return "".concat(this.componentVersion, " (Base: ").concat(this.baseVersion, ")");
  }
  /** Optionally apply an external linked style sheet (called from connectedCallback)
   * @param {*} url The URL for the linked style sheet
   */
  async doInheritStyles() {
    if (!this.hasAttribute("inherit-style")) return;
    let url2 = this.getAttribute("inherit-style");
    if (!url2) url2 = "./index.css";
    const linkEl = document.createElement("link");
    linkEl.setAttribute("type", "text/css");
    linkEl.setAttribute("rel", "stylesheet");
    linkEl.setAttribute("href", url2);
    this.shadowRoot.appendChild(linkEl);
    console.info("[".concat(this.localName, '] Inherit-style requested. Loading: "').concat(url2, '"'));
  }
  /** OPTIONAL. Update runtime configuration, return complete config
   * @param {object|undefined} config If present, partial or full set of options. If undefined, fn returns the current full option settings
   */
  config(config) {
    if (config) this.opts = _TiBaseComponent.deepAssign(this.opts, config);
    return this.opts;
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
  /** Ensure that the component instance has a unique ID & check again if uib loaded */
  ensureId() {
    this.uib = !!window["uibuilder"];
    if (!this.id) {
      this.id = "".concat(this.localName, "-").concat(++this.constructor._iCount);
    }
  }
  /** Creates the $ and $$ fns that do css selections against the shadow dom */
  createShadowSelectors() {
    var _a3, _b;
    this.$ = (_a3 = this.shadowRoot) == null ? void 0 : _a3.querySelector.bind(this.shadowRoot);
    this.$$ = (_b = this.shadowRoot) == null ? void 0 : _b.querySelectorAll.bind(this.shadowRoot);
  }
  // TODO Needs enhancing - does nothing at the moment
  /** Handle a `uibuilder:msg:_ui:update:${this.id}` custom event
   * @param {CustomEvent} evt uibuilder `uibuilder:msg:_ui:update:${this.id}` custom event evt.details contains the data
   */
  _uibMsgHandler(evt) {
  }
  /** Custom event dispacher `component-name:name` with detail data
   * @example
   *   this._event('ready')
   * @example
   *   this._event('ready', {age: 42, type: 'android'})
   *
   * @param {string} name A name to give the event, added to the component-name separated with a :
   * @param {*=} data Optional data object to pass to event listeners via the evt.detail property
   */
  _event(name2, data) {
    this.dispatchEvent(new CustomEvent("".concat(this.localName, ":").concat(name2), {
      bubbles: true,
      composed: true,
      detail: {
        id: this.id,
        name: this.name,
        data
      }
    }));
  }
  /** Standardised constructor. Keep after call to super()
   * @param {Node|string} template Nodes/string content that will be cloned into the shadow dom
   * @param {{mode:'open'|'closed',delegatesFocus:boolean}=} shadowOpts Options passed to attachShadow
   */
  _construct(template, shadowOpts) {
    if (!shadowOpts) shadowOpts = { mode: "open", delegatesFocus: true };
    this.attachShadow(shadowOpts).append(template);
    this.createShadowSelectors();
  }
  /** Standardised connection. Call from the start of connectedCallback fn */
  _connect() {
    this.ensureId();
    this.doInheritStyles();
  }
  /** Standardised disconnection. Call from the END of disconnectedCallback fn */
  _disconnect() {
    document.removeEventListener("uibuilder:msg:_ui:update:".concat(this.id), this._uibMsgHandler);
    this._event("disconnected");
  }
  /** Call from end of connectedCallback */
  _ready() {
    this.connected = true;
    this._event("connected");
    this._event("ready");
  }
};
/** Component version */
__publicField(_TiBaseComponent, "baseVersion", "2025-01-09");
/** Holds a count of how many instances of this component are on the page that don't have their own id
 * Used to ensure a unique id if needing to add one dynamically
 */
__publicField(_TiBaseComponent, "_iCount", 0);
var TiBaseComponent = _TiBaseComponent;
var ti_base_component_default = TiBaseComponent;

// src/components/uib-var.js
var _variable, _varCb, _topic, _topicCb;
var UibVar = class extends ti_base_component_default {
  //#endregion --- Class Properties ---
  constructor() {
    super();
    //#region --- Class Properties ---
    /** Name of the uibuilder mangaged variable to use @type {string} */
    __privateAdd(this, _variable);
    /** Current value of the watched variable */
    __publicField(this, "value");
    /** Holds reference to var watch callback so it can be cancelled @type {Function} */
    __privateAdd(this, _varCb);
    /** The watched msg topic @type {string} */
    __privateAdd(this, _topic);
    /** Holds reference to topic watch callback so it can be cancelled @type {Function} */
    __privateAdd(this, _topicCb);
    /** Whether to output if the variable is undefined */
    __publicField(this, "undef", false);
    /** Whether to send update value to Node-RED on change */
    __publicField(this, "report", false);
    /** What is the value type */
    __publicField(this, "type", "plain");
    /** what are the available types? */
    __publicField(this, "types", ["plain", "html", "markdown", "object", "json", "table", "list", "array"]);
  }
  /** Makes HTML attribute change watched
   * @returns {Array<string>} List of all of the html attribs (props) listened to
   */
  static get observedAttributes() {
    return [
      // Standard watched attributes:
      /* 'inherit-style', */
      "name",
      // Other watched attributes:            
      "filter",
      "id",
      "report",
      "topic",
      "type",
      "undefined",
      "variable"
    ];
  }
  /** Set the uibuilder variable name to watch */
  set variable(varName) {
    __privateSet(this, _variable, varName);
    this.splitVarName;
    if (varName) {
      try {
        this.splitVarName = varName.split(/[\.\[\]\'\"]/);
        __privateSet(this, _variable, varName = this.splitVarName.shift());
      } catch (e) {
        throw new Error("[".concat(this.localName, '] variable attribute: Name split failed on "').concat(varName, '". ').concat(e.message));
      }
    }
    if (__privateGet(this, _varCb)) this.uibuilder.cancelChange(varName, __privateGet(this, _varCb));
    if (!varName) return;
    __privateSet(this, _varCb, this.uibuilder.onChange(varName, this._varChange.bind(this)));
  }
  /** Get the watched uibuilder variable name */
  get variable() {
    return __privateGet(this, _variable);
  }
  /** Set the uibuilder msg topic to watch. We could use `uibuilder:msg:topic:${msg.topic}` event instead */
  set topic(topicName) {
    __privateSet(this, _topic, topicName);
    if (__privateGet(this, _topicCb)) this.uibuilder.cancelTopic(topicName, __privateGet(this, _topicCb));
    if (!topicName) return;
    __privateSet(this, _topicCb, this.uibuilder.onTopic(topicName, this._topicChange.bind(this)));
  }
  /** Get the watched uibuilder msg topic */
  get topic() {
    return __privateGet(this, _topic);
  }
  // Runs when an instance is added to the DOM
  connectedCallback() {
    this._connect();
    this.variable = this.getAttribute("variable");
    this.topic = this.getAttribute("topic");
    this._ready();
  }
  // Runs when an instance is removed from the DOM
  disconnectedCallback() {
    if (__privateGet(this, _varCb)) this.uibuilder.cancelChange(__privateGet(this, _variable), __privateGet(this, _varCb));
    if (__privateGet(this, _topicCb)) {
      this.uibuilder.cancelTopic(__privateGet(this, _topic), __privateGet(this, _topicCb));
      Object.keys(__privateGet(this, _topicCb)).forEach((topic) => {
        this.uibuilder.cancelTopic(topic, __privateGet(this, _topicCb)[topic]);
      });
    }
    this._disconnect();
  }
  /** Handle watched attributes
   * NOTE: On initial startup, this is called for each watched attrib set in HTML - BEFORE connectedCallback is called.
   * Attribute values can only ever be strings
   * @param {string} attrib The name of the attribute that is changing
   * @param {string} newVal The new value of the attribute
   * @param {string} oldVal The old value of the attribute
   */
  attributeChangedCallback(attrib, oldVal, newVal) {
    if (oldVal === newVal) return;
    this[attrib] = newVal;
    switch (attrib) {
      case "undefined": {
        if (newVal === "" || ["on", "true", "report"].includes(newVal.toLowerCase())) this.undef = true;
        else this.undef = false;
        break;
      }
      case "report": {
        if (newVal === "" || ["on", "true", "report"].includes(newVal.toLowerCase())) this.report = true;
        else this.report = false;
        break;
      }
      case "type": {
        if (newVal === "" || !this.types.includes(newVal.toLowerCase())) this.type = "plain";
        else this.type = newVal;
        break;
      }
      case "filter": {
        this.filter = void 0;
        this.filterArgs = [];
        if (!newVal) break;
        this.filter = newVal;
        newVal = newVal.slice(0, 127);
        const f = newVal.replace(/\s/g, "").match(/([a-zA-Z_$][a-zA-Z_$0-9.-]+)(\((.*)\))?/);
        if (!f) {
          console.warn('\u26A0\uFE0F [uib-var] Filter function "'.concat(newVal, '" invalid. Cannot process.'));
          break;
        }
        this.filter = f[1];
        if (f[3]) {
          try {
            this.filterArgs = JSON.parse(f[3]);
          } catch (e) {
          }
          this.filterArgs = f[3].split(",").map((x) => {
            x = x.trim();
            if (isNaN(x)) {
              let y = x.replace(/^["'`]/, "").replace(/["'`]$/, "");
              try {
                y = new Function("return ".concat(y))();
              } catch (e) {
              }
              return y;
            }
            return Number(x);
          });
        }
        if (!this.variable && !this.topic) this.showVar(false);
        break;
      }
      default: {
        break;
      }
    }
    this._event("attribChanged", { attribute: attrib, newVal, oldVal });
  }
  // --- end of attributeChangedCallback --- //
  /** Process watched uibuilder variable value change
   * @param {*} value The value of the managed uibuilder variable
   */
  _varChange(value2) {
    let success = true;
    if (this.splitVarName.length > 0) {
      let target = value2;
      let partSuccess = [];
      try {
        this.splitVarName.forEach((part) => {
          let successPart;
          if (target[part] === void 0) successPart = false;
          else successPart = true;
          partSuccess.push(successPart);
          target = target[part];
        });
        value2 = target;
        success = partSuccess.filter(Boolean).length > 0 ? true : false;
      } catch (e) {
        success = false;
      }
    }
    if (success) {
      this.value = value2;
      this.showVar();
      if (this.report === true) this.uibuilder.send({ topic: this.variable, payload: this.value || void 0, source: this.localName, id: this.id });
    }
  }
  /** Process watched uibuilder msg.topic received
   * @param {object} msg The value of the managed uibuilder variable
   */
  _topicChange(msg) {
    this.uibuilder.log("trace", this.localName, "Topic msg received: '".concat(msg.topic, "'"), msg);
    this.value = msg.payload;
    this.showVar();
    if (this.report === true) this.uibuilder.send({ topic: msg.topic, payload: this.value || void 0, source: this.localName, id: this.id });
  }
  /** Convert this.value to DOM output (applies output filter if needed)
   * @param {boolean} chkVal If true (default), check for undefined value. False used to run filter even with no value set.
   */
  showVar(chkVal = true) {
    this.uibuilder.log("trace", this.localName, "showVar. chkVal: '".concat(chkVal, "'. Value="), this.value);
    if (chkVal === true && !this.value && this.undef !== true) {
      return;
    }
    let val = chkVal ? this.doFilter(this.value) : this.doFilter();
    let out = val;
    switch (this.type) {
      case "markdown": {
        if (this.uib) out = this.uibuilder.convertMarkdown(val);
        break;
      }
      case "json":
      case "object": {
        out = '<pre class="syntax-highlight">'.concat(this.uib ? this.uibuilder.syntaxHighlight(val) : val, "</pre>");
        break;
      }
      case "table": {
        out = this.uibuilder.buildHtmlTable(val).outerHTML;
        break;
      }
      case "array":
      case "list": {
        if (!Array.isArray(val)) val = [val];
        out = "<ul>";
        val.forEach((li) => {
          out += "<li>".concat(li, "</li>");
        });
        out += "</ul>";
        break;
      }
      case "plain":
      case "html":
      default: {
        const t = typeof val;
        if (Array.isArray(val) || t === "[object Object]" || t === "object") {
          try {
            out = JSON.stringify(val);
          } catch (e) {
          }
        }
        break;
      }
    }
    if (this.uib) this.innerHTML = this.uibuilder.sanitiseHTML(out);
    else this.innerHTML = out;
  }
  /** Apply value filter if specified
   * @param {*} value The value to change
   * @returns {*} The amended value that will be displayed
   */
  doFilter(value2) {
    if (this.filter) {
      const splitFilter = this.filter.split(".");
      let globalFn = globalThis[splitFilter[0]];
      if (globalFn && splitFilter.length > 1) {
        const parts2 = [splitFilter.pop()];
        parts2.forEach((part) => {
          globalFn = globalFn[part];
        });
      }
      if (!globalFn && this.uib === true) globalFn = this.uibuilder[splitFilter[0]];
      if (globalFn && typeof globalFn !== "function") globalFn = void 0;
      if (globalFn) {
        const argList = value2 === void 0 ? [...this.filterArgs] : [value2, ...this.filterArgs];
        value2 = Reflect.apply(globalFn, value2 != null ? value2 : globalFn, argList);
      } else {
        console.warn('\u26A0\uFE0F [uib-var] Filter function "'.concat(this.filter, '" ').concat(typeof globalFn === "object" ? "is an object not a function" : "not found"));
      }
    }
    return value2;
  }
};
_variable = new WeakMap();
_varCb = new WeakMap();
_topic = new WeakMap();
_topicCb = new WeakMap();
/** Component version */
__publicField(UibVar, "componentVersion", "2025-01-05");
var uib_var_default = UibVar;
window["UibVar"] = UibVar;

// src/components/uib-meta.js
var UibMeta = class extends ti_base_component_default {
  //#endregion --- Class Properties ---
  constructor() {
    super();
    //#region --- Class Properties ---
    /** @type {string} Name of the uibuilder mangaged variable to use */
    __publicField(this, "variable", "pageMeta");
    /** Current value of the watched variable */
    __publicField(this, "value");
    /** Whether to output if the variable is undefined */
    __publicField(this, "undef", false);
    /** Whether to send update value to Node-RED on change */
    __publicField(this, "report", false);
    /** What is the value type */
    __publicField(this, "type", "created");
    /** what are the available types? */
    __publicField(this, "types", ["created", "updated", "crup", "both", "size", "modified", "all"]);
    /** Chosen formatting - default to none */
    __publicField(this, "format", "");
    /** what are the available formats? */
    __publicField(this, "formats", ["d", "dt", "t", "k", "m"]);
    /** Holds uibuilder.onTopic listeners */
    __publicField(this, "topicMonitors", {});
    this.shadow = this.attachShadow({ mode: "open", delegatesFocus: true });
    this.$ = this.shadowRoot.querySelector.bind(this.shadowRoot);
    if (!this.uibuilder) throw new Error("[uib-meta] uibuilder client library not available");
    this.value = this.uibuilder.get("pageMeta");
    if (!this.value) this.uibuilder.getPageMeta();
    this.doWatch();
  }
  // Makes HTML attribute change watched
  static get observedAttributes() {
    return [
      // Standard watched attributes:
      "inherit-style",
      "name",
      // Other watched attributes:
      "type",
      "format"
    ];
  }
  // Runs when an instance is added to the DOM
  connectedCallback() {
    this._connect();
    this._ready();
  }
  // Runs when an instance is removed from the DOM
  disconnectedCallback() {
    this._disconnect();
  }
  /** Handle watched attributes
   * NOTE: On initial startup, this is called for each watched attrib set in HTML - BEFORE connectedCallback is called.
   * Attribute values can only ever be strings
   * @param {string} attrib The name of the attribute that is changing
   * @param {string} newVal The new value of the attribute
   * @param {string} oldVal The old value of the attribute
   */
  attributeChangedCallback(attrib, oldVal, newVal) {
    if (oldVal === newVal) return;
    switch (attrib) {
      case "type": {
        if (newVal === "" || !this.types.includes(newVal.toLowerCase())) this.type = "created";
        else this.type = newVal;
        break;
      }
      case "format": {
        if (!this.formats.includes(newVal.toLowerCase())) this.type = "";
        else this[attrib] = newVal;
        break;
      }
      default: {
        this[attrib] = newVal;
        break;
      }
    }
    this._event("attribChanged", { attribute: attrib, newVal, oldVal });
  }
  /** Process changes to the required uibuilder variable */
  doWatch() {
    this.varDom();
    window["uibuilder"].onChange(this.variable, (val) => {
      this.value = val;
      this.varDom();
      if (this.report === true) window["uibuilder"].send({ topic: this.variable, payload: this.value || void 0 });
    });
  }
  /** Convert this.value to DOM output (applies output filter if needed)
   * @param {boolean} chkVal If true (default), check for undefined value. False used to run filter even with no value set.
   */
  varDom(chkVal = true) {
    if (chkVal === true && !this.value && this.undef !== true) {
      this.shadow.innerHTML = "<slot></slot>";
      return;
    }
    let out;
    switch (this.type.toLowerCase()) {
      case "all": {
        out = "Created: ".concat(this.doFormat(this.value.created, "dt"), ", Updated: ").concat(this.doFormat(this.value.modified, "dt"));
        out += ", Size: ".concat(this.doFormat(this.value.size, "num"), "b");
        break;
      }
      case "size": {
        out = "Size: ".concat(this.doFormat(this.value.size, "num"), "b");
        break;
      }
      case "modified":
      case "updated": {
        out = "Updated: ".concat(this.doFormat(this.value.modified, "dt"));
        break;
      }
      case "both":
      // both created and updated dates
      case "created-updated":
      case "crup": {
        out = "Created: ".concat(this.doFormat(this.value.created, "dt"), ", Updated: ").concat(this.doFormat(this.value.modified, "dt"));
        break;
      }
      case "created":
      default: {
        out = "Created: ".concat(this.doFormat(this.value.created, "dt"));
        break;
      }
    }
    if (out !== void 0) this.shadow.innerHTML = out;
  }
  /** Format a value using this.format
   * @param {Date|string|number} val Value to format
   * @param {'num'|'dt'} type Type of of input
   * @returns {*} Formatted value
   */
  doFormat(val, type) {
    if (this.format === "") return val;
    let out;
    switch (this.format) {
      case "d": {
        if (type === "dt") out = new Date(val).toLocaleDateString();
        else out = val;
        break;
      }
      case "t": {
        if (type === "dt") out = new Date(val).toLocaleTimeString();
        else out = val;
        break;
      }
      case "dt": {
        if (type === "dt") out = new Date(val).toLocaleString();
        else out = val;
        break;
      }
      case "k": {
        if (type === "num") out = "".concat(uibuilder.round(val / 1024, 1), " k");
        else out = val;
        break;
      }
      case "m": {
        if (type === "num") out = "".concat(uibuilder.round(val / 1048576, 2), " M");
        else out = val;
        break;
      }
      default: {
        out = val;
      }
    }
    return out;
  }
  /** Apply value filter if specified
   * @param {*} value The value to change
   * @returns {*} The amended value that will be displayed
   */
  // doFilter(value) {
  //     if (this.filter) {
  //         // Cater for dotted notation functions (e.g. uibuilder.get)
  //         const splitFilter = this.filter.split('.')
  //         let globalFn = globalThis[splitFilter[0]]
  //         if (globalFn && splitFilter.length > 1) {
  //             const parts = [splitFilter.pop()]
  //             parts.forEach( part => {
  //                 globalFn = globalFn[part]
  //             } )
  //         }
  //         if (!globalFn && this.uib === true) globalFn = globalThis['uibuilder'][splitFilter[0]]
  //         if (globalFn && typeof globalFn !== 'function' ) globalFn = undefined
  //         if (globalFn) {
  //             const argList = value === undefined ? [...this.filterArgs] : [value, ...this.filterArgs]
  //             value = Reflect.apply(globalFn, value ?? globalFn, argList)
  //         } else {
  //             console.warn(`⚠️ [uib-var] Filter function "${this.filter}" ${typeof globalFn === 'object' ? 'is an object not a function' : 'not found'}`)
  //         }
  //     }
  //     return value
  // }
};
/** Component version */
__publicField(UibMeta, "componentVersion", "2025-01-06");
var uib_meta_default = UibMeta;
window["UibMeta"] = UibMeta;

// src/components/apply-template.js
var ApplyTemplate = class extends ti_base_component_default {
  constructor() {
    super();
    // Holder for once attribute
    __publicField(this, "once", false);
    if (!this.uibuilder) throw new Error("[apply-template] uibuilder client library not available");
  }
  // Makes HTML attribute change watched
  static get observedAttributes() {
    return [
      // Standard watched attributes:
      /*'inherit-style',*/
      "name",
      // Other watched attributes:
      "template-id",
      "once"
    ];
  }
  // Runs when an instance is added to the DOM
  connectedCallback() {
    this._connect();
    const templateId = this["template-id"];
    const onceOnly = this["once"];
    if (!templateId) {
      throw new Error("[ApplyTemplate] Template id attribute not provided. Template must be identified by an id attribute");
    }
    const template = document.getElementById(templateId);
    if (!template || template.tagName !== "TEMPLATE") {
      throw new Error("[ApplyTemplate] Source must be a <template>. id='".concat(templateId, "'"));
    }
    const existContent = this.innerHTML;
    this.innerHTML = "";
    let templateContent;
    if (onceOnly === false) {
      templateContent = document.importNode(template.content, true);
    } else {
      templateContent = document.adoptNode(template.content);
    }
    this.appendChild(templateContent);
    if (existContent) {
      const slot = this.getElementsByTagName("slot");
      if (slot.length > 0) {
        slot[0].innerHTML = existContent;
      }
    }
    this._ready();
  }
  /** Runs when an instance is removed from the DOM */
  disconnectedCallback() {
    this._disconnect();
  }
  /** Handle watched attributes
   * NOTE: On initial startup, this is called for each watched attrib set in HTML - BEFORE connectedCallback is called.
   * Attribute values can only ever be strings
   * @param {string} attrib The name of the attribute that is changing
   * @param {string} newVal The new value of the attribute
   * @param {string} oldVal The old value of the attribute
   */
  attributeChangedCallback(attrib, oldVal, newVal) {
    if (oldVal === newVal) return;
    this[attrib] = newVal;
    this._event("attribChanged", { attribute: attrib, newVal, oldVal });
  }
};
/** Component version */
__publicField(ApplyTemplate, "componentVersion", "2025-01-05");
var apply_template_default = ApplyTemplate;
window["ApplyTemplate"] = ApplyTemplate;

// src/front-end-module/reactive.mjs
var Reactive = class {
  // Version of the reactive module
  /** Create a new Reactive instance
   * @param {*} srcvar The source variable to wrap
   */
  constructor(srcvar) {
    this.target = typeof srcvar === "object" && srcvar !== null ? srcvar : { value: srcvar };
    this.changeListeners = /* @__PURE__ */ new Map();
    this.listenerIdCounter = 0;
  }
  /** Helper function to check if an object is already reactive
   * @param {*} obj Object to check
   * @returns {boolean} True if the object is already reactive
   * @private
   */
  _isReactive(obj) {
    return obj && obj.__v_isReactive === true;
  }
  /** Helper function to trigger all change listeners
   * @param {string} propertyPath Full property path (e.g., "user.name")
   * @param {*} value New value
   * @param {*} oldValue Previous value
   * @param {*} target The target object
   * @private
   */
  _triggerListeners(propertyPath, value2, oldValue, target) {
    this.changeListeners.forEach((callback) => {
      try {
        callback(value2, oldValue, propertyPath, target);
      } catch (error) {
        console.warn('[uibuilder:reactive] Error in onChange listener for "'.concat(propertyPath, '":'), error);
      }
    });
  }
  /** Helper function to make an object reactive with property path tracking
   * @param {*} obj Object to make reactive
   * @param {string} basePath Base property path for nested objects
   * @returns {Proxy} Reactive proxy object
   * @private
   */
  _createReactiveObject(obj, basePath = "") {
    if (!obj || typeof obj !== "object") return obj;
    if (this._isReactive(obj)) return obj;
    if (Element && obj instanceof Element || typeof obj === "function" || obj instanceof Date || obj instanceof RegExp) {
      console.warn("[uibuilder:reactive] Can not proxy DOM elements, functions or other special objects");
      return obj;
    }
    const proxy = new Proxy(obj, {
      get: (target, key, receiver) => {
        if (key === "__v_isReactive") return true;
        if (key === "onChange") {
          return (callback) => {
            if (typeof callback !== "function") {
              throw new Error("[uibuilder:reactive] onChange callback must be a function");
            }
            const listenerId = ++this.listenerIdCounter;
            this.changeListeners.set(listenerId, callback);
            return {
              id: listenerId,
              cancel: () => {
                this.changeListeners.delete(listenerId);
              }
            };
          };
        }
        if (key === "cancelChange") {
          return (listenerRef) => {
            if (!listenerRef || typeof listenerRef.cancel !== "function") {
              console.warn("[uibuilder:reactive] Invalid listener reference provided to cancelChange");
              return false;
            }
            try {
              listenerRef.cancel();
              return true;
            } catch (error) {
              console.warn("[uibuilder:reactive] Error cancelling listener:", error);
              return false;
            }
          };
        }
        const result = Reflect.get(target, key, receiver);
        if (result && typeof result === "object" && !this._isReactive(result)) {
          const newPath = basePath ? "".concat(basePath, ".").concat(String(key)) : String(key);
          return this._createReactiveObject(result, newPath);
        }
        return result;
      },
      set: (target, key, value2, receiver) => {
        if (key === "__v_isReactive" || key === "onChange" || key === "cancelChange") return true;
        const oldValue = target[key];
        const hadKey = Object.prototype.hasOwnProperty.call(target, key);
        const result = Reflect.set(target, key, value2, receiver);
        if (!hadKey || value2 !== oldValue) {
          const propertyPath = basePath ? "".concat(basePath, ".").concat(String(key)) : String(key);
          this._triggerListeners(propertyPath, value2, oldValue, receiver);
          try {
            this._dispatchCustomEvent("uibuilder:reactive:propertyChanged", {
              property: propertyPath,
              value: value2,
              oldValue,
              target: receiver
            });
          } catch (error) {
            console.warn("[uibuilder:reactive] Error dispatching custom event:", error);
          }
        }
        return result;
      },
      deleteProperty: (target, key) => {
        const hadKey = Object.prototype.hasOwnProperty.call(target, key);
        const oldValue = target[key];
        const result = Reflect.deleteProperty(target, key);
        if (hadKey && result) {
          const propertyPath = basePath ? "".concat(basePath, ".").concat(String(key)) : String(key);
          this._triggerListeners(propertyPath, void 0, oldValue, target);
          try {
            this._dispatchCustomEvent("uibuilder:reactive:propertyDeleted", {
              property: propertyPath,
              oldValue,
              target
            });
          } catch (error) {
            console.warn("[uibuilder:reactive] Error dispatching delete event:", error);
          }
        }
        return result;
      }
    });
    return proxy;
  }
  /** Standard fn to create a custom event with details & dispatch it
   * @param {string} title The event name
   * @param {*} details Any details to pass to event output
   * @private
   */
  _dispatchCustomEvent(title, details) {
    const event2 = new CustomEvent(title, { detail: details });
    document.dispatchEvent(event2);
  }
  /** Create and return the reactive proxy
   * @returns {Proxy} A proxy object that can be used reactively
   */
  create() {
    return this._createReactiveObject(this.target);
  }
  /** Get the number of active listeners
   * @returns {number} Number of active change listeners
   */
  getListenerCount() {
    return this.changeListeners.size;
  }
  /** Clear all listeners
   * @returns {void}
   */
  clearAllListeners() {
    this.changeListeners.clear();
  }
};
__publicField(Reactive, "version", "2025-06-14");
function reactive(srcvar) {
  const reactiveInstance = new Reactive(srcvar);
  return reactiveInstance.create();
}

// src/front-end-module/uibuilder.module.mjs
var version = "7.5.0-esm";
var isMinified = !/param/.test(function(param) {
});
function log() {
  const args = Array.from(arguments);
  let level = args.shift();
  let strLevel;
  switch (level) {
    case "trace":
    case 5: {
      if (log.level < 5) break;
      level = 5;
      strLevel = "trace";
      break;
    }
    case "debug":
    case 4: {
      if (log.level < 4) break;
      level = 4;
      strLevel = "debug";
      break;
    }
    case "log":
    case 3: {
      if (log.level < 3) break;
      level = 3;
      strLevel = "log";
      break;
    }
    case "info":
    case "":
    case 2: {
      if (log.level < 2) break;
      level = 2;
      strLevel = "info";
      break;
    }
    case "warn":
    case 1: {
      if (log.level < 1) break;
      level = 1;
      strLevel = "warn";
      break;
    }
    case "error":
    case "err":
    case 0: {
      if (log.level < 0) break;
      level = 0;
      strLevel = "error";
      break;
    }
    case "print": {
      if (log.level < 0) break;
      level = 0;
      strLevel = "print";
      break;
    }
    default: {
      level = -1;
      break;
    }
  }
  if (strLevel === void 0) return function() {
  };
  const head = args.shift();
  return Function.prototype.bind.call(
    console[log.LOG_STYLES[strLevel].console],
    console,
    "%c".concat(log.LOG_STYLES[strLevel].pre).concat(strLevel, "%c [").concat(head, "]"),
    "".concat(log.LOG_STYLES.level, " ").concat(log.LOG_STYLES[strLevel].css),
    "".concat(log.LOG_STYLES.head, " ").concat(log.LOG_STYLES[strLevel].txtCss),
    ...args
  );
}
log.LOG_STYLES = {
  // 0
  print: {
    css: "background: grey; color: yellow;",
    txtCss: "color: grey;",
    pre: "\u27A1\uFE0F",
    console: "log"
  },
  error: {
    css: "background: red; color: black;",
    txtCss: "color: red; ",
    pre: "\u26D4 ",
    console: "error"
    // or trace
  },
  // 1
  warn: {
    css: "background: darkorange; color: black;",
    txtCss: "color: darkorange; ",
    pre: "\u26A0 ",
    console: "warn"
  },
  // 2
  info: {
    css: "background: aqua; color: black;",
    txtCss: "color: aqua;",
    pre: "\u2757 ",
    console: "info"
  },
  // 3
  log: {
    css: "background: grey; color: yellow;",
    txtCss: "color: grey;",
    pre: "",
    console: "log"
  },
  // 4
  debug: {
    css: "background: chartreuse; color: black;",
    txtCss: "color: chartreuse;",
    pre: "",
    console: "debug"
  },
  // 5
  trace: {
    css: "background: indigo; color: yellow;",
    txtCss: "color: hotpink;",
    pre: "",
    console: "log"
  },
  names: ["print", "error", "warn", "info", "log", "debug", "trace"],
  reset: "color: inherit;",
  head: "font-weight:bold; font-style:italic;",
  level: "font-weight:bold; border-radius: 3px; padding: 2px 5px; display:inline-block;"
};
log.default = 1;
var ll;
var scriptElement;
try {
  scriptElement = document.currentScript;
  ll = scriptElement.getAttribute("logLevel");
} catch (e) {
}
if (ll === void 0) {
  try {
    const url2 = new URL(import.meta.url).searchParams;
    ll = url2.get("logLevel");
  } catch (e) {
  }
}
if (ll !== void 0) {
  ll = Number(ll);
  if (isNaN(ll)) {
    console.warn('[Uib:constructor] Cannot set logLevel to "'.concat(scriptElement == null ? void 0 : scriptElement.getAttribute("logLevel"), '". Defaults to 0 (error).'));
    log.default = 0;
  } else log.default = ll;
}
log.level = log.default;
function syntaxHighlight(json) {
  if (json === void 0) {
    json = '<span class="undefined">undefined</span>';
  } else {
    try {
      json = JSON.stringify(json, void 0, 4);
      json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function(match) {
        let cls = "number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "key";
          } else {
            cls = "string";
          }
        } else if (/true|false/.test(match)) {
          cls = "boolean";
        } else if (/null/.test(match)) {
          cls = "null";
        }
        return '<span class="'.concat(cls, '">').concat(match, "</span>");
      });
    } catch (e) {
      json = "Syntax Highlight ERROR: ".concat(e.message);
    }
  }
  return json;
}
var _ui = new ui_default(window, log, syntaxHighlight);
var _a2, _pingInterval, _propChangeCallbacks, _msgRecvdByTopicCallbacks, _timerid, _MsgHandler, _isShowMsg, _isShowStatus, _sendUrlHash, _uniqueElID, _extCommands, _managedVars, _showStatus, _uiObservers, _uibAttrSel;
var Uib = (_a2 = class {
  // #endregion -------- ------------ -------- //
  // #region Watch for and process uib-* or data-uib-* attributes in HTML and auto-process
  /** Attempt to load a service worker
   * https://yonatankra.com/how-service-workers-sped-up-our-website-by-97-5/
   * @param {string} fileName Name of service worker js file (without .js extension)
   */
  // async registerServiceWorker(fileName) {
  //     if (!navigator.serviceWorker) return
  //     await navigator.serviceWorker.register(
  //         `./${fileName}.js`,
  //         {
  //             scope: './',
  //         }
  //     )
  // }
  /** Wrap an object in a JS proxy
   * WARNING: Sadly, `let x = uib.createProxy( [1,2] ); x.push(3);` Does not trigger a send because that is classed as a
   * GET, not a SET.
   * param {*} target The target object to proxy
   * returns {Proxy} A proxied version of the target object
   */
  // createProxy(target) {
  //     return new Proxy(target, {
  //         _doSend(prop, val, oldVal) {
  //             uibuilder.send({
  //                 topic: 'uibuilder/proxy/change',
  //                 _uib: {
  //                     varChange: {
  //                         name: self.$name,
  //                         property: prop,
  //                         oldValue: oldVal,
  //                         newValue: val,
  //                     }
  //                 },
  //                 payload: target,
  //             })
  //         },
  //         get(target, prop, receiver) {
  //             console.log('uib proxy - GET: ', prop, target)
  //             let val = Reflect.get(...arguments)
  //             if (typeof val === 'function') val = val.bind(target)
  //             if (self.$sendChanges) this._doSend(prop, Reflect.get(target))
  //             return val
  //         },
  //         set(target, prop, val, receiver) {
  //             if (prop === '$sendChanges') {
  //                 self.$sendChanges = typeof val === 'boolean' ? val : false
  //                 return true
  //             }
  //             if (prop === '$name') {
  //                 self.$name = typeof val === 'string' ? val : undefined
  //                 return true
  //             }
  //             console.log('uib proxy - SET: ', val, prop, target)
  //             const oldVal = Reflect.get(...arguments)
  //             const worked = Reflect.set(target, prop, val, receiver)
  //             if (self.$sendChanges && worked) {
  //                 self._doSend(prop, val, oldVal)
  //             }
  //             return worked
  //         },
  //     })
  // }
  // #endregion ! EXPERIMENTAL
  // #region ------- Class construction & startup method -------- //
  constructor() {
    // #endregion ---- ---- ---- ----
    // #region private class vars
    // How many times has the loaded instance connected to Socket.IO (detect if not a new load?)
    __publicField(this, "connectedNum", 0);
    // event listener callbacks by property name
    // #events = {}
    // Socket.IO channel names
    __publicField(this, "_ioChannels", { control: "uiBuilderControl", client: "uiBuilderClient", server: "uiBuilder" });
    /** setInterval holder for pings @type {function|undefined} */
    __privateAdd(this, _pingInterval);
    // onChange event callbacks
    __privateAdd(this, _propChangeCallbacks, {});
    // onTopic event callbacks
    __privateAdd(this, _msgRecvdByTopicCallbacks, {});
    // Is Vue available?
    __publicField(this, "isVue", false);
    // What version? Set in startup if Vue is loaded. Won't always work
    __publicField(this, "vueVersion");
    /** setInterval id holder for Socket.IO checkConnect
     * @type {number|null}
     */
    __privateAdd(this, _timerid, null);
    // Holds the reference ID for the internal msg change event handler so that it can be cancelled
    __privateAdd(this, _MsgHandler);
    // Placeholder for io.socket - can't make a # var until # fns allowed in all browsers
    __publicField(this, "_socket");
    // Placeholder for an observer that watches the whole DOM for changes - can't make a # var until # fns allowed in all browsers
    __publicField(this, "_htmlObserver");
    // Has showMsg been turned on?
    __privateAdd(this, _isShowMsg, false);
    // Has showStatus been turned on?
    __privateAdd(this, _isShowStatus, false);
    // If true, URL hash changes send msg back to node-red. Controlled by watchUrlHash()
    __privateAdd(this, _sendUrlHash, false);
    // Used to help create unique element ID's if one hasn't been provided, increment on use
    __privateAdd(this, _uniqueElID, 0);
    // Externally accessible command functions (NB: Case must match) - remember to update _uibCommand for new commands
    __privateAdd(this, _extCommands, [
      "elementExists",
      "get",
      "getManagedVarList",
      "getWatchedVars",
      "htmlSend",
      "include",
      "navigate",
      "scrollTo",
      "set",
      "showMsg",
      "showStatus",
      "uiGet",
      "uiWatch",
      "watchUrlHash"
    ]);
    /** @type {Object<string, string>} Managed uibuilder variables */
    __privateAdd(this, _managedVars, {});
    // What status variables to show via showStatus()
    __privateAdd(this, _showStatus, {
      online: { var: "online", label: "Online?", description: "Is the browser online?" },
      ioConnected: { var: "ioConnected", label: "Socket.IO connected?", description: "Is Socket.IO connected?" },
      connectedNum: { var: "connectedNum", label: "# reconnections", description: "How many times has Socket.IO had to reconnect since last page load?" },
      clientId: { var: "clientId", label: "Client ID", description: "Static client unique id set in Node-RED. Only changes when browser is restarted." },
      tabId: { var: "tabId", label: "Browser tab ID", description: "Static unique id for the browser's current tab" },
      cookies: { var: "cookies", label: "Cookies", description: "Cookies set in Node-RED" },
      httpNodeRoot: { var: "httpNodeRoot", label: "httpNodeRoot", description: "From Node-RED' settings.js, affects URL's. May be wrong for pages in sub-folders" },
      pageName: { var: "pageName", label: "Page name", description: "Actual name of this page" },
      ioNamespace: { var: "ioNamespace", label: "SIO namespace", description: "Socket.IO namespace - unique to each uibuilder node instance" },
      // ioPath: { 'var': 'ioPath', 'label': 'SIO path', 'description': '', }, // no longer needed in the modern client
      socketError: { var: "socketError", label: "Socket error", description: "If the Socket.IO connection has failed, says why" },
      msgsSent: { var: "msgsSent", label: "# msgs sent", description: "How many standard messages have been sent to Node-RED?" },
      msgsReceived: { var: "msgsReceived", label: "# msgs received", description: "How many standard messages have been received from Node-RED?" },
      msgsSentCtrl: { var: "msgsSentCtrl", label: "# control msgs sent", description: "How many control messages have been sent to Node-RED?" },
      msgsCtrlReceived: { var: "msgsCtrlReceived", label: "# control msgs received", description: "How many control messages have been received from Node-RED?" },
      originator: { var: "originator", label: "Node Originator", description: "If the last msg from Node-RED was from a `uib-sender` node, this will be its node id so that messasges can be returned to it" },
      topic: { var: "topic", label: "Default topic", description: "Optional default topic to be included in outgoing standard messages" },
      started: { var: "started", label: "Has uibuilder client started?", description: "Whether `uibuilder.start()` ran successfully. This should self-run and should not need to be run manually" },
      version: { var: "version", label: "uibuilder client version", description: "The version of the loaded uibuilder client library" },
      serverTimeOffset: { var: "serverTimeOffset", label: "Server time offset (Hrs)", description: "The number of hours difference between the Node-red server and the client" }
    });
    // Track ui observers (see uiWatch)
    __privateAdd(this, _uiObservers, {});
    // List of uib specific attributes that will be watched and processed dynamically
    __publicField(this, "uibAttribs", ["uib-topic", "data-uib-topic"]);
    __privateAdd(this, _uibAttrSel, "[".concat(this.uibAttribs.join("], ["), "]"));
    //#endregion
    // #region public class vars
    // TODO Move to proper getters
    // #region ---- Externally read-only (via .get method) ---- //
    // version - moved to _meta
    /** Client ID set by uibuilder on connect */
    __publicField(this, "clientId", "");
    /** The collection of cookies provided by uibuilder */
    __publicField(this, "cookies", {});
    /** Copy of last control msg object received from sever */
    __publicField(this, "ctrlMsg", {});
    /** Is Socket.IO client connected to the server? */
    __publicField(this, "ioConnected", false);
    // Is the library running from a minified version?
    __publicField(this, "isMinified", isMinified);
    // Is the browser tab containing this page visible or not?
    __publicField(this, "isVisible", false);
    // Remember the last page (re)load/navigation type: navigate, reload, back_forward, prerender
    __publicField(this, "lastNavType", "");
    // Max msg size that can be sent over Socket.IO - updated by "client connect" msg receipt
    __publicField(this, "maxHttpBufferSize", 1048576);
    /** Last std msg received from Node-RED */
    __publicField(this, "msg", {});
    /** number of messages sent to server since page load */
    __publicField(this, "msgsSent", 0);
    /** number of messages received from server since page load */
    __publicField(this, "msgsReceived", 0);
    /** number of control messages sent to server since page load */
    __publicField(this, "msgsSentCtrl", 0);
    /** number of control messages received from server since page load */
    __publicField(this, "msgsCtrlReceived", 0);
    /** Is the client online or offline? */
    __publicField(this, "online", navigator.onLine);
    /** last control msg object sent via uibuilder.send() @since v2.0.0-dev3 */
    __publicField(this, "sentCtrlMsg", {});
    /** last std msg object sent via uibuilder.send() */
    __publicField(this, "sentMsg", {});
    /** placeholder to track time offset from server, see fn socket.on(ioChannels.server ...) */
    __publicField(this, "serverTimeOffset", null);
    /** placeholder for a socket error message */
    __publicField(this, "socketError", null);
    // tab identifier from session storage
    __publicField(this, "tabId", "");
    // Actual name of current page (set in constructor)
    __publicField(this, "pageName", null);
    // Is the DOMPurify library loaded? Updated in start()
    __publicField(this, "purify", false);
    // Is the Markdown-IT library loaded? Updated in start()
    __publicField(this, "markdown", false);
    // Current URL hash. Initial set is done from start->watchHashChanges via a set to make it watched
    __publicField(this, "urlHash", location.hash);
    // #endregion ---- ---- ---- ---- //
    // TODO Move to proper getters/setters
    // #region ---- Externally Writable (via .set method, read via .get method) ---- //
    /** Default originator node id - empty string by default
     * @type {string}
     */
    __publicField(this, "originator", "");
    /** Default topic - used by send if set and no topic provided
     * @type {(string|undefined)}
     */
    __publicField(this, "topic");
    /** Either undefined or a reference to a uib router instance
     * Set by uibrouter, do not set manually.
     */
    __publicField(this, "uibrouterinstance");
    /** Set by uibrouter, do not set manually */
    __publicField(this, "uibrouter_CurrentRoute");
    // #endregion ---- ---- ---- ---- //
    // #region ---- These are unlikely to be needed externally: ----
    __publicField(this, "autoSendReady", true);
    __publicField(this, "httpNodeRoot", "");
    // Node-RED setting (via cookie)
    __publicField(this, "ioNamespace", "");
    __publicField(this, "ioPath", "");
    __publicField(this, "retryFactor", 1.5);
    // starting delay factor for subsequent reconnect attempts
    __publicField(this, "retryMs", 2e3);
    // starting retry ms period for manual socket reconnections workaround
    __publicField(this, "storePrefix", "uib_");
    // Prefix for all uib-related localStorage
    __publicField(this, "started", false);
    // NOTE: These can only change when a client (re)connects
    __publicField(this, "socketOptions", {
      path: this.ioPath,
      // https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
      // https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API
      // https://socket.io/get-started/webtransport
      // NOTE: webtransport requires HTTP/3 and TLS. HTTP/2 & 3 not yet available in Node.js
      // transports: ['polling', 'websocket', 'webtransport'],
      transports: ["polling", "websocket"],
      // Using callback so that they are updated automatically on (re)connect
      // Only put things in here that will be valid for a websocket connected session
      auth: (cb) => {
        cb({
          clientVersion: version,
          clientId: this.clientId,
          pathName: window.location.pathname,
          urlParams: Object.fromEntries(new URLSearchParams(location.search)),
          pageName: this.pageName,
          tabId: this.tabId,
          lastNavType: this.lastNavType,
          connectedNum: ++this.connectedNum,
          // Used to calculate the diff between the server and client connection timestamps - reported if >1 minute
          browserConnectTimestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      },
      transportOptions: {
        // Can only set headers when polling
        polling: {
          extraHeaders: {
            "x-clientid": "".concat(_a2._meta.displayName, "; ").concat(_a2._meta.type, "; ").concat(_a2._meta.version, "; ").concat(this.clientId)
          }
        }
      }
    });
    // --- End of elementIsVisible --- //
    // #endregion -------- -------- -------- //
    // #region ------- UI handlers --------- //
    // #region -- Direct to _ui --
    // ! NOTE: Direct assignments change the target `this` to here. Use with caution
    // However, also note that the window/jsdom and the window.document
    // references are now static in _ui so not impacted by this.
    /** Simplistic jQuery-like document CSS query selector, returns an HTML Element
     * NOTE that this fn returns the element itself. Use $$ to get the properties of 1 or more elements.
     * If the selected element is a <template>, returns the first child element.
     * type {HTMLElement}
     * @param {string} cssSelector A CSS Selector that identifies the element to return
     * @returns {HTMLElement|null} Selected HTML element or null
     */
    __publicField(this, "$", _ui.$);
    /** CSS query selector that returns ALL found selections. Matches the Chromium DevTools feature of the same name.
     * NOTE that this fn returns an array showing the PROPERTIES of the elements whereas $ returns the element itself
     * @param {string} cssSelector A CSS Selector that identifies the elements to return
     * @returns {HTMLElement[]} Array of DOM elements/nodes. Array is empty if selector is not found.
     */
    __publicField(this, "$$", _ui.$$);
    /** Reference to the full ui library */
    __publicField(this, "$ui", _ui);
    /** Add 1 or several class names to an element
     * @param {string|string[]} classNames Single or array of classnames
     * @param {HTMLElement} el HTML Element to add class(es) to
     */
    __publicField(this, "addClass", _ui.addClass);
    /** Apply a source template tag to a target html element
     * NOTES:
     * - styles in ALL templates are accessible to all templates.
     * - scripts in templates are run AT TIME OF APPLICATION (so may run multiple times).
     * - scripts in templates are applied in order of application, so variables may not yet exist if defined in subsequent templates
     * @param {HTMLElement} source The source element
     * @param {HTMLElement} target The target element
     * @param {boolean} onceOnly If true, the source will be adopted (the source is moved)
     */
    __publicField(this, "applyTemplate", _ui.applyTemplate);
    /** Remove All, 1 or more class names from an element
     * @param {undefined|null|""|string|string[]} classNames Single or array of classnames. If undefined, "" or null, remove all classes
     * @param {HTMLElement} el HTML Element to add class(es) to
     */
    __publicField(this, "removeClass", _ui.removeClass);
    log("trace", "Uib:constructor", "Starting")();
    window.addEventListener("offline", (e) => {
      this.set("online", false);
      this.set("ioConnected", false);
      log("warn", "Browser", "DISCONNECTED from network")();
    });
    window.addEventListener("online", (e) => {
      this.set("online", true);
      log("warn", "Browser", "Reconnected to network")();
      this._checkConnect();
    });
    document.cookie.split(";").forEach((c) => {
      const splitC = c.split("=");
      this.cookies[splitC[0].trim()] = splitC[1];
    });
    this.set("clientId", this.cookies["uibuilder-client-id"]);
    log("trace", "Uib:constructor", "Client ID: ", this.clientId)();
    this.set("tabId", window.sessionStorage.getItem("tabId"));
    if (!this.tabId) {
      this.set("tabId", "t".concat(Math.floor(Math.random() * 1e6)));
      window.sessionStorage.setItem("tabId", this.tabId);
    }
    document.addEventListener("load", () => {
      this.set("isVisible", true);
    });
    document.addEventListener("visibilitychange", () => {
      this.set("isVisible", document.visibilityState === "visible");
      this.sendCtrl({ uibuilderCtrl: "visibility", isVisible: this.isVisible });
    });
    document.addEventListener("uibuilder:propertyChanged", (event2) => {
      if (!__privateGet(this, _isShowStatus)) return;
      if (event2.detail.prop in __privateGet(this, _showStatus)) {
        document.querySelector('td[data-vartype="'.concat(event2.detail.prop, '"]')).innerText = JSON.stringify(event2.detail.value);
      }
    });
    this.set("ioNamespace", this._getIOnamespace());
    if ("uibuilder-webRoot" in this.cookies) {
      this.set("httpNodeRoot", this.cookies["uibuilder-webRoot"]);
      log("trace", "Uib:constructor", 'httpNodeRoot set by cookie to "'.concat(this.httpNodeRoot, '"'))();
    } else {
      const fullPath = window.location.pathname.split("/").filter(function(t) {
        return t.trim() !== "";
      });
      if (fullPath.length > 0 && fullPath[fullPath.length - 1].endsWith(".html")) fullPath.pop();
      fullPath.pop();
      this.set("httpNodeRoot", "/".concat(fullPath.join("/")));
      log("trace", "[Uib:constructor]", 'httpNodeRoot set by URL parsing to "'.concat(this.httpNodeRoot, '". NOTE: This may fail for pages in sub-folders.'))();
    }
    this.set("ioPath", this.urlJoin(this.httpNodeRoot, _a2._meta.displayName, "vendor", "socket.io"));
    log("trace", "Uib:constructor", 'ioPath: "'.concat(this.ioPath, '"'))();
    this.set("pageName", window.location.pathname.replace("".concat(this.ioNamespace, "/"), ""));
    if (this.pageName.endsWith("/")) this.set("pageName", "".concat(this.pageName, "index.html"));
    if (this.pageName === "") this.set("pageName", "index.html");
    try {
      const autoloadVars = this.getStore("_uibAutoloadVars");
      if (Object.keys(autoloadVars).length > 0) {
        Object.keys(autoloadVars).forEach((id) => {
          this.set(id, this.getStore(id));
        });
      }
    } catch (e) {
    }
    this._dispatchCustomEvent("uibuilder:constructorComplete");
    log("trace", "Uib:constructor", "Ending")();
  }
  // #endregion -- not external --
  // #endregion --- End of variables ---
  // #region ------- Getters and Setters ------- //
  // Change logging level dynamically (affects both console. and print.)
  set logLevel(level) {
    log.level = level;
    console.log(
      "%c\u2757 info%c [logLevel]",
      "".concat(log.LOG_STYLES.level, " ").concat(log.LOG_STYLES.info.css),
      "".concat(log.LOG_STYLES.head, " ").concat(log.LOG_STYLES.info.txtCss),
      "Set to ".concat(level, " (").concat(log.LOG_STYLES.names[level], ")")
    );
  }
  get logLevel() {
    return log.level;
  }
  get meta() {
    return _a2._meta;
  }
  /** Function to set uibuilder properties to a new value - works on any property except _* or #*
   * Also triggers any event listeners.
   * Example: this.set('msg', {topic:'uibuilder', payload:42});
   * @param {string} prop Any uibuilder property who's name does not start with a _ or #
   * @param {*} val The set value of the property or a string declaring that a protected property cannot be changed
   * @param {boolean} [store] If true, the variable is also saved to the browser localStorage if possible
   * @param {boolean} [autoload] If true & store is true, on load, uib will try to restore the value from the store automatically
   * @returns {*} Input value
   */
  set(prop, val, store = false, autoload = false) {
    var _a3;
    if (prop.startsWith("_") || prop.startsWith("#")) {
      log("warn", "Uib:set", 'Cannot use set() on protected property "'.concat(prop, '"'))();
      return 'Cannot use set() on protected property "'.concat(prop, '"');
    }
    const oldVal = (_a3 = this[prop]) != null ? _a3 : void 0;
    this[prop] = val;
    __privateGet(this, _managedVars)[prop] = prop;
    if (store === true) this.setStore(prop, val, autoload);
    log("trace", "Uib:set", "prop set - prop: ".concat(prop, ", val: "), val, " store: ".concat(store, ", autoload: ").concat(autoload))();
    this._dispatchCustomEvent("uibuilder:propertyChanged", { prop, value: val, oldValue: oldVal, store, autoload });
    this._dispatchCustomEvent("uibuilder:propertyChanged:".concat(prop), { prop, value: val, oldValue: oldVal, store, autoload });
    return val;
  }
  /** Function to get the value of a uibuilder property
   * Example: uibuilder.get('msg')
   * @param {string} prop The name of the property to get as long as it does not start with a _ or #
   * @returns {*|undefined} The current value of the property
   */
  get(prop) {
    if (prop.startsWith("_") || prop.startsWith("#")) {
      log("warn", "Uib:get", 'Cannot use get() on protected property "'.concat(prop, '"'))();
      return;
    }
    if (prop === "version") return _a2._meta.version;
    if (prop === "msgsCtrl") return this.msgsCtrlReceived;
    if (prop === "reconnections") return this.connectedNum;
    if (this[prop] === void 0) {
      log("warn", "Uib:get", 'get() - property "'.concat(prop, '" is undefined'))();
    }
    return this[prop];
  }
  /** Write to localStorage if possible. console error output if can't write
   * Also uses this.storePrefix
   * @example
   *   uibuilder.setStore('fred', 42)
   *   console.log(uibuilder.getStore('fred'))
   * @param {string} id localStorage var name to be used (prefixed with 'uib_')
   * @param {*} value value to write to localstore
   * @param {boolean} [autoload] If true, on load, uib will try to restore the value from the store
   * @returns {boolean} True if succeeded else false
   */
  setStore(id, value2, autoload = false) {
    let autoVars = {};
    if (autoload === true) {
      try {
        autoVars = this.getStore("_uibAutoloadVars") || {};
      } catch (e) {
      }
    }
    if (typeof value2 === "object") {
      try {
        value2 = JSON.stringify(value2);
      } catch (e) {
        log("error", "Uib:setStore", "Cannot stringify object, not storing. ", e)();
        return false;
      }
    }
    try {
      localStorage.setItem(this.storePrefix + id, value2);
      if (autoload) {
        autoVars[id] = id;
        try {
          localStorage.setItem(this.storePrefix + "_uibAutoloadVars", JSON.stringify(autoVars));
        } catch (e) {
          log("error", "Uib:setStore", "Cannot save autoload list. ", e)();
        }
      }
      this._dispatchCustomEvent("uibuilder:propertyStored", { prop: id, value: value2, autoload });
      return true;
    } catch (e) {
      log("error", "Uib:setStore", "Cannot write to localStorage. ", e)();
      return false;
    }
  }
  // --- end of setStore --- //
  /** Attempt to get and re-hydrate a key value from localStorage
   * Note that all uib storage is automatically prefixed using this.storePrefix
   * @param {*} id The key of the value to attempt to retrieve
   * @returns {*|null|undefined} The re-hydrated value of the key or null if key not found, undefined on error
   */
  getStore(id) {
    try {
      return JSON.parse(localStorage.getItem(this.storePrefix + id));
    } catch (e) {
    }
    try {
      return localStorage.getItem(this.storePrefix + id);
    } catch (e) {
      return void 0;
    }
  }
  /** Remove a given id from the uib keys in localStorage
   * @param {*} id The key to remove
   */
  removeStore(id) {
    try {
      localStorage.removeItem(this.storePrefix + id);
    } catch (e) {
    }
  }
  /** Returns a list of uibuilder properties (variables) that can be watched with onChange
   * @returns {Object<string,string>} List of uibuilder managed variables
   */
  getManagedVarList() {
    return __privateGet(this, _managedVars);
  }
  getWatchedVars() {
    return Object.keys(__privateGet(this, _propChangeCallbacks));
  }
  // #endregion ------- -------- ------- //
  // #region ------- Our own event handling system ---------- //
  /** Standard fn to create a custom event with details & dispatch it
   * @param {string} title The event name
   * @param {*} details Any details to pass to event output
   * @private
   */
  _dispatchCustomEvent(title, details) {
    const event2 = new CustomEvent(title, { detail: details });
    document.dispatchEvent(event2);
  }
  // See the this.#propChangeCallbacks & msgRecvdByTopicCallbacks private vars
  /** Register on-change event listeners for uibuilder tracked properties
   * Make it possible to register a function that will be run when the property changes.
   * Note that you can create listeners for non-existant properties
   * @example uibuilder.onChange('msg', (msg) => { console.log('uibuilder.msg changed! It is now: ', msg) })
   *
   * @param {string} prop The property of uibuilder that we want to monitor
   * @param {Function} callback The function that will run when the property changes, parameter is the new value of the property after change
   * @returns {number} A reference to the callback to cancel, save and pass to uibuilder.cancelChange if you need to remove a listener
   */
  onChange(prop, callback) {
    if (!__privateGet(this, _propChangeCallbacks)[prop]) __privateGet(this, _propChangeCallbacks)[prop] = { _nextRef: 1 };
    else __privateGet(this, _propChangeCallbacks)[prop]._nextRef++;
    const nextCbRef = __privateGet(this, _propChangeCallbacks)[prop]._nextRef;
    const propChangeCallback = __privateGet(this, _propChangeCallbacks)[prop][nextCbRef] = function propChangeCallback2(e) {
      if (prop === e.detail.prop) {
        const value2 = e.detail.value;
        callback.call(value2, value2);
      }
    };
    document.addEventListener("uibuilder:propertyChanged", propChangeCallback);
    return nextCbRef;
  }
  // ---- End of onChange() ---- //
  cancelChange(prop, cbRef) {
    document.removeEventListener("uibuilder:propertyChanged", __privateGet(this, _propChangeCallbacks)[prop][cbRef]);
    delete __privateGet(this, _propChangeCallbacks)[prop][cbRef];
  }
  /** Register a change callback for a specific msg.topic
   * Similar to onChange but more convenient if needing to differentiate by msg.topic.
   * @example let otRef = uibuilder.onTopic('mytopic', function(){ console.log('Received a msg with msg.topic=`mytopic`. msg: ', this) })
   * To cancel a change listener: uibuilder.cancelTopic('mytopic', otRef)
   *
   * @param {string} topic The msg.topic we want to listen for
   * @param {Function} callback The function that will run when an appropriate msg is received. `this` inside the callback as well as the cb's single argument is the received msg.
   * @returns {number} A reference to the callback to cancel, save and pass to uibuilder.cancelTopic if you need to remove a listener
   */
  onTopic(topic, callback) {
    if (!__privateGet(this, _msgRecvdByTopicCallbacks)[topic]) __privateGet(this, _msgRecvdByTopicCallbacks)[topic] = { _nextRef: 1 };
    else __privateGet(this, _msgRecvdByTopicCallbacks)[topic]._nextRef++;
    const nextCbRef = __privateGet(this, _msgRecvdByTopicCallbacks)[topic]._nextRef;
    const msgRecvdEvtCallback = __privateGet(this, _msgRecvdByTopicCallbacks)[topic][nextCbRef] = function msgRecvdEvtCallback2(e) {
      const msg = e.detail;
      if (msg.topic === topic) {
        callback.call(msg, msg);
      }
    };
    document.addEventListener("uibuilder:stdMsgReceived", msgRecvdEvtCallback);
    return nextCbRef;
  }
  cancelTopic(topic, cbRef) {
    document.removeEventListener("uibuilder:stdMsgReceived", __privateGet(this, _msgRecvdByTopicCallbacks)[topic][cbRef]);
    delete __privateGet(this, _msgRecvdByTopicCallbacks)[topic][cbRef];
  }
  /** Trigger event listener for a given property
   * Called when uibuilder.set is used
   *
   * @param {*} prop The property for which to run the callback functions
   * arguments: Additional arguments contain the value to pass to the event callback (e.g. newValue)
   */
  // emit(prop) {
  //     var evt = this.#events[prop]
  //     if (!evt) {
  //         return
  //     }
  //     var args = Array.prototype.slice.call(arguments, 1)
  //     for (var i = 0; i < evt.length; i++) {
  //         evt[i].apply(this, args)
  //     }
  //     log('trace', 'Uib:emit', `${evt.length} listeners run for prop ${prop} `)()
  // }
  /** Forcibly removes all event listeners from the events array
   * Use if you need to re-initialise the environment
   */
  // clearEventListeners() {
  //     this.#events = []
  // } // ---- End of clearEventListeners() ---- //
  /** Clear a single property event listeners
   * @param {string} prop The property of uibuilder for which we want to clear the event listener
   */
  // clearListener(prop) {
  //     if (this.#events[prop]) delete this.#events[prop]
  // }
  // #endregion ---------- End of event handling system ---------- //
  // #region ------- General Utility Functions -------- //
  /** Check supplied msg from server for a timestamp - if received, work out & store difference to browser time
   * @param {object} receivedMsg A message object recieved from Node-RED
   * @returns {void} Updates self.serverTimeOffset if different to previous value
   * @private
   */
  _checkTimestamp(receivedMsg) {
    if (Object.prototype.hasOwnProperty.call(receivedMsg, "serverTimestamp")) {
      const serverTimestamp = new Date(receivedMsg.serverTimestamp);
      const offset = Math.round((/* @__PURE__ */ new Date() - serverTimestamp) / 36e5);
      if (offset !== this.serverTimeOffset) {
        log("trace", "Uib:checkTimestamp:".concat(this._ioChannels.server, " (server)"), "Offset changed to: ".concat(offset, " from: ").concat(this.serverTimeOffset))();
        this.set("serverTimeOffset", offset);
      }
    }
  }
  /** Set up an event listener to watch for hash changes
   * and set the watchable urlHash variable
   * @private
   */
  _watchHashChanges() {
    this.set("urlHash", location.hash);
    window.addEventListener("hashchange", (event2) => {
      this.set("urlHash", location.hash);
      if (__privateGet(this, _sendUrlHash) === true) {
        this.send({ topic: "hashChange", payload: location.hash, newHash: this.keepHashFromUrl(event2.newURL), oldHash: this.keepHashFromUrl(event2.oldURL) });
      }
    });
  }
  /** Returns a new array containing the intersection of the 2 input arrays
   * @param {Array} a1 Array to check
   * @param {Array} a2 Array to intersect
   * @returns {Array} The intersection of the 2 arrays (may be an empty array)
   */
  arrayIntersect(a1, a2) {
    return a1.filter((uName) => a2.includes(uName));
  }
  /** Copies a uibuilder variable to the browser clipboard
   * @param {string} varToCopy The name of the uibuilder variable to copy to the clipboard
   */
  copyToClipboard(varToCopy) {
    let data = "";
    try {
      data = JSON.stringify(this.get(varToCopy));
    } catch (e) {
      log("error", "copyToClipboard", 'Could not copy "'.concat(varToCopy, '" to clipboard.'), e.message)();
    }
    navigator.clipboard.writeText(data);
  }
  // --- End of copyToClipboard --- //
  /** Does the chosen CSS Selector currently exist?
   * Automatically sends a msg back to Node-RED unless turned off.
   * @param {string} cssSelector Required. CSS Selector to examine for visibility
   * @param {boolean} [msg] Optional, default=true. If true also sends a message back to Node-RED
   * @returns {boolean} True if the element exists
   */
  elementExists(cssSelector, msg = true) {
    const el = document.querySelector(cssSelector);
    let exists = false;
    if (el !== null) exists = true;
    if (msg === true) {
      this.send({
        payload: exists,
        info: 'Element "'.concat(cssSelector, '" ').concat(exists ? "exists" : "does not exist")
      });
    }
    return exists;
  }
  // --- End of elementExists --- //
  /** Format a number using the INTL standard library - compatible with uib-var filter function
   * @param {number} value Number to format
   * @param {number} decimalPlaces Number of decimal places to include. Default=no default
   * @param {string} intl standard locale spec, e.g. "ja-JP" or "en-GB". Default=navigator.language
   * @param {object} opts INTL library options object. Optional
   * @returns {string} formatted number
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
   */
  formatNumber(value2, decimalPlaces, intl, opts) {
    if (isNaN(value2)) {
      log("error", "formatNumber", 'Value must be a number. Value type: "'.concat(typeof value2, '"'))();
      return "NaN";
    }
    if (!opts) opts = {};
    if (!intl) intl = navigator.language ? navigator.language : "en-GB";
    if (decimalPlaces) {
      opts.minimumFractionDigits = decimalPlaces;
      opts.maximumFractionDigits = decimalPlaces;
    }
    let out;
    try {
      out = Number(value2).toLocaleString(intl, opts);
    } catch (e) {
      log("error", "formatNumber", "".concat(e.message, ". value=").concat(value2, ", dp=").concat(decimalPlaces, ', intl="').concat(intl, '", opts=').concat(JSON.stringify(opts)))();
      return "NaN";
    }
    return out;
  }
  /** Attempt to get rough size of an object
   * @param {*} obj Any serialisable object
   * @returns {number|undefined} Rough size of object in bytes or undefined
   */
  getObjectSize(obj) {
    let size;
    try {
      const jsonString = JSON.stringify(obj);
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(jsonString);
      size = uint8Array.length;
    } catch (e) {
      log("error", "uibuilder:getObjectSize", "Could not stringify, cannot determine size", obj, e)();
    }
    return size;
  }
  /** Returns true if a uibrouter instance is loaded, otherwise returns false
   * @returns {boolean} true if uibrouter instance loaded else false
   */
  hasUibRouter() {
    return !!this.uibrouterinstance;
  }
  /** Only keep the URL Hash & ignoring query params
   * @param {string} url URL to extract the hash from
   * @returns {string} Just the route id
   */
  keepHashFromUrl(url2) {
    if (!url2) return "";
    return "#" + url2.replace(/^.*#(.*)/, "$1").replace(/\?.*$/, "");
  }
  log() {
    log(...arguments)();
  }
  /** Makes a null or non-object into an object. If thing is already an object.
   * If not null, moves "thing" to {payload:thing}
   * @param {*} thing Thing to check
   * @param {string} [property] property that "thing" is moved to if not null and not an object. Default='payload'
   * @returns {!object} _
   */
  makeMeAnObject(thing, property) {
    if (!property) property = "payload";
    if (typeof property !== "string") {
      log("warn", "uibuilder:makeMeAnObject", "WARNING: property parameter must be a string and not: ".concat(typeof property))();
      property = "payload";
    }
    let out = {};
    if (thing !== null && thing.constructor.name === "Object") {
      out = thing;
    } else if (thing !== null) {
      out[property] = thing;
    }
    return out;
  }
  // --- End of make me an object --- //
  /** Navigate to a new page or a new route (hash)
   * @param {string} url URL to navigate to. Can be absolute or relative (to current page) or just a hash for a route change
   * @returns {Location} The new window.location string
   */
  navigate(url2) {
    if (url2) window.location.href = url2;
    return window.location;
  }
  /** Wrap a provided variable in a proxy object so that it can be used reactively
   * @param {*} srcvar The source variable to wrap
   * @returns {Proxy} A proxy object that can be used reactively
   */
  reactive(srcvar) {
    return reactive(srcvar);
  }
  /** Get the Reactive class for advanced usage
   * @returns {Function} The Reactive class constructor
   * @example
   * const ReactiveClass = uib.getReactiveClass()
   * const reactiveInstance = new ReactiveClass(data, customEventDispatcher)
   * const proxy = reactiveInstance.create()
   */
  getReactiveClass() {
    return Reactive;
  }
  // ! TODO change ui uib-* attributes to use this
  /** Convert a string attribute into an variable/constant reference
   * Used to resolve data sources in attributes
   * @param {string} path The string path to resolve, must be relative to the `window` global scope
   * @returns {*} The resolved data source or null
   */
  resolveDataSource(path) {
    try {
      const parts2 = path.split(/[\.\[\]\'\"]/).filter(Boolean);
      let data = window;
      for (const part of parts2) {
        data = data == null ? void 0 : data[part];
      }
      return data;
    } catch (error) {
      log("error", "uibuilder:resolveDataSource", 'Error resolving data source "'.concat(path, "\", returned 'null'. ").concat(error.message))();
      return null;
    }
  }
  /** Fast but accurate number rounding (https://stackoverflow.com/a/48764436/1309986 solution 2)
   * Half away from zero method (AKA "commercial" rounding), most common type
   * @param {number} num The number to be rounded
   * @param {number} decimalPlaces Number of DP's to round to
   * @returns {number} Rounded number
   */
  round(num, decimalPlaces) {
    const p = Math.pow(10, decimalPlaces || 0);
    const n = num * p * (1 + Number.EPSILON);
    return Math.round(n) / p;
  }
  /** Set the default originator. Set to '' to ignore. Used with uib-sender.
   * @param {string} [originator] A Node-RED node ID to return the message to
   */
  setOriginator(originator = "") {
    this.set("originator", originator);
  }
  // ---- End of setOriginator ---- //
  /** HTTP Ping/Keep-alive - makes a call back to uibuilder's ExpressJS server and receives a 204 response
   * Can be used to keep sessions alive.
   * @example
   *   uibuilder.setPing(2000) // repeat every 2 sec. Re-issue with ping(0) to turn off repeat.
   *   uibuilder.onChange('ping', function(data) {
   *      console.log('pinger', data)
   *   })
   * @param {number} ms Repeat interval in ms
   */
  setPing(ms = 0) {
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", () => {
      const headers = oReq.getAllResponseHeaders().split("\r\n");
      const elapsedTime = Number(/* @__PURE__ */ new Date()) - Number(oReq.responseURL.split("=")[1]);
      this.set("ping", {
        success: !!(oReq.status === 201 || oReq.status === 204),
        // true if one of the listed codes else false
        status: oReq.status,
        headers,
        url: oReq.responseURL,
        elapsedTime
      });
    });
    if (__privateGet(this, _pingInterval)) {
      clearInterval(__privateGet(this, _pingInterval));
      __privateSet(this, _pingInterval, void 0);
    }
    oReq.open("GET", "".concat(this.httpNodeRoot, "/uibuilder/ping?t=").concat(Number(/* @__PURE__ */ new Date())));
    oReq.send();
    if (ms > 0) {
      __privateSet(this, _pingInterval, setInterval(() => {
        oReq.open("GET", "".concat(this.httpNodeRoot, "/uibuilder/ping?t=").concat(Number(/* @__PURE__ */ new Date())));
        oReq.send();
      }, ms));
    }
  }
  // ---- End of ping ---- //
  /** Convert JSON to Syntax Highlighted HTML
   * @param {object} json A JSON/JavaScript Object
   * @returns {html} Object reformatted as highlighted HTML
   */
  syntaxHighlight(json) {
    return syntaxHighlight(json);
  }
  // --- End of syntaxHighlight --- //
  /** Returns true/false or a default value for truthy/falsy and other values
   * @param {string|number|boolean|*} val The value to test
   * @param {any} deflt Default value to use if the value is not truthy/falsy
   * @returns {boolean|any} The truth! Or the default
   */
  truthy(val, deflt) {
    let ret;
    if (["on", "On", "ON", "true", "True", "TRUE", "1", true, 1].includes(val)) ret = true;
    else if (["off", "Off", "OFF", "false", "False", "FALSE", "0", false, 0].includes(val)) ret = false;
    else ret = deflt;
    return ret;
  }
  /** Joins all arguments as a URL string
   * see http://stackoverflow.com/a/28592528/3016654
   * since v1.0.10, fixed potential double // issue
   * arguments {string} URL fragments
   * @returns {string} _
   */
  urlJoin() {
    const paths = Array.prototype.slice.call(arguments);
    const url2 = "/" + paths.map(function(e) {
      return e.replace(/^\/|\/$/g, "");
    }).filter(function(e) {
      return e;
    }).join("/");
    return url2.replace("//", "/");
  }
  // ---- End of urlJoin ---- //
  /** Turn on/off/toggle sending URL hash changes back to Node-RED
   * @param {string|number|boolean|undefined} [toggle] Optional on/off/etc
   * @returns {boolean} True if we will send a msg to Node-RED on a hash change
   */
  watchUrlHash(toggle) {
    __privateSet(this, _sendUrlHash, this.truthy(toggle, __privateGet(this, _sendUrlHash) !== true));
    return __privateGet(this, _sendUrlHash);
  }
  /** DEPRECATED FOR NOW - wasn't working properly.
   * Is the chosen CSS Selector currently visible to the user? NB: Only finds the FIRST element of the selection.
   * Requires IntersectionObserver (available to all mainstream browsers from early 2019)
   * Automatically sends a msg back to Node-RED.
   * Requires the element to already exist.
   * @returns {false} False if not visible
   */
  elementIsVisible() {
    const info = "elementIsVisible has been temporarily DEPRECATED as it was not working correctly and a fix is complex";
    log("error", "uib:elementIsVisible", info)();
    this.send({ payload: "elementIsVisible has been temporarily DEPRECATED as it was not working correctly and a fix is complex" });
    return false;
  }
  /** Column metadata object definition
   * @typedef columnDefinition
   * @property {number} index The column index number
   * @property {boolean} hasName Whether the column has a defined name or not
   * @property {string} title The title of the column. Shown in the table header row
   * @property {string=} name Optional. A defined column name that will be added as the `data-col-name` to all cells in the column if defined
   * @property {string|number=} key Optional. A key value (currently unused)
   * @property {"string"|"date"|"number"|"html"=} dataType FOR FUTURE USE. Optional. What type of data will this column contain?
   * @property {boolean=} editable FOR FUTURE USE. Optional. Can cells in this column be edited?
   */
  /** Builds an HTML table from an array (or object) of objects
   * 1st row is used for columns.
   * If an object of objects, inner keys are used to populate th/td `data-col-name` attribs.
   * @param {Array<object>|object} data Input data array or object
   * @param {object} opts Table options
   *   @param {Array<columnDefinition>=} opts.cols Column metadata. If not provided will be derived from 1st row of data
   * @returns {HTMLTableElement|HTMLParagraphElement} Output HTML Element
   */
  buildHtmlTable(data, opts = {}) {
    return _ui.buildHtmlTable(data, opts);
  }
  /** Directly add a table to a parent element.
   * @param {Array<object>|Array<Array>|object} data  Input data array or object. Object of objects gives named rows. Array of objects named cols. Array of arrays no naming.
   * @param {object} [opts] Build options
   *   @param {Array<columnDefinition>=} opts.cols Column metadata. If not provided will be derived from 1st row of data
   *   @param {HTMLElement|string} opts.parent Default=body. The table will be added as a child instead of returned. May be an actual HTML element or a CSS Selector
   *   @param {boolean=} opts.allowHTML Optional, default=false. If true, allows HTML cell content, otherwise only allows text. Always sanitise HTML inputs
   */
  createTable(data = [], opts = { parent: "body" }) {
    _ui.createTable(data, opts);
  }
  /** Converts markdown text input to HTML if the Markdown-IT library is loaded
   * Otherwise simply returns the text
   * @param {string} mdText The input markdown string
   * @returns {string} HTML (if Markdown-IT library loaded and parse successful) or original text
   */
  convertMarkdown(mdText) {
    return _ui.convertMarkdown(mdText);
  }
  /** ASYNC: Include HTML fragment, img, video, text, json, form data, pdf or anything else from an external file or API
   * Wraps the included object in a div tag.
   * PDF's, text or unknown MIME types are also wrapped in an iFrame.
   * @param {string} url The URL of the source file to include
   * @param {object} uiOptions Object containing properties recognised by the _uiReplace function. Must at least contain an id
   * param {string} uiOptions.id The HTML ID given to the wrapping DIV tag
   * param {string} uiOptions.parentSelector The CSS selector for a parent element to insert the new HTML under (defaults to 'body')
   */
  async include(url2, uiOptions) {
    await _ui.include(url2, uiOptions);
  }
  /** Attach a new remote script to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} url The url to be used in the script src attribute
   */
  loadScriptSrc(url2) {
    _ui.loadScriptSrc(url2);
  }
  /** Attach a new remote stylesheet link to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} url The url to be used in the style link href attribute
   */
  loadStyleSrc(url2) {
    _ui.loadStyleSrc(url2);
  }
  /** Attach a new text script to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} textFn The text to be loaded as a script
   */
  loadScriptTxt(textFn) {
    _ui.loadScriptTxt(textFn);
  }
  /** Attach a new text stylesheet to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} textFn The text to be loaded as a stylesheet
   */
  loadStyleTxt(textFn) {
    _ui.loadStyleTxt(textFn);
  }
  /** Load a dynamic UI from a JSON web reponse
   * @param {string} url URL that will return the ui JSON
   */
  loadui(url2) {
    _ui.loadui(url2);
  }
  /** Replace or add an HTML element's slot from text or an HTML string
   * WARNING: Executes <script> tags! And will process <style> tags.
   * Will use DOMPurify if that library has been loaded to window.
   * param {*} ui Single entry from the msg._ui property
   * @param {Element} el Reference to the element that we want to update
   * @param {*} slot The slot content we are trying to add/replace (defaults to empty string)
   */
  replaceSlot(el, slot) {
    _ui.replaceSlot(el, slot);
  }
  /** Replace or add an HTML element's slot from a Markdown string
   * Only does something if the markdownit library has been loaded to window.
   * Will use DOMPurify if that library has been loaded to window.
   * @param {Element} el Reference to the element that we want to update
   * @param {*} component The component we are trying to add/replace
   */
  replaceSlotMarkdown(el, component) {
    _ui.replaceSlotMarkdown(el, component);
  }
  /** Sanitise HTML to make it safe - if the DOMPurify library is loaded
   * Otherwise just returns that HTML as-is.
   * @param {string} html The input HTML string
   * @returns {string} The sanitised HTML or the original if DOMPurify not loaded
   */
  sanitiseHTML(html) {
    return _ui.sanitiseHTML(html);
  }
  /** Add table event listener that returns the text or html content of either the full row or a single cell
   * NOTE: Assumes that the table has a `tbody` element.
   * If cells have a `data-col-name` attribute, it will be used in the output as the column name.
   * @example tblAddListener('#eltest-tbl-table', {}, myVar)
   * @example tblAddListener('#eltest-tbl-table', {eventScope: 'cell'}, myVar2)
   *
   * @param {string} tblSelector The table CSS Selector
   * @param {object} [options] Additional options. Default={}
   *   @param {"row"|"cell"=} options.eventScope Optional, default=row. Return data for either the whole row (as an object) or for the single cell clicked
   *   @param {"text"|"html"=} options.returnType Optional, default=text. Return text or html data
   *   @param {number=} options.pad Optional, default=3. Will be used to front-pad unnamed column references with zeros. e.g. 3 => "C002"/"C012"/"C342"
   *   @param {boolean=} options.send Optional, default=true. If uibuilder is present, will automatically send a message back to Node-RED.
   *   @param {string|number=} options.logLevel Optional, default=3/info. Numeric or string log level matching uibuilder's log levels.
   *   @param {string} [options.eventType] Optional, default=click. What event to listen for.
   * @param {object=} out A variable reference that will be updated with the output data upon a click event
   */
  tblAddListener(tblSelector, options = {}, out = {}) {
    _ui.tblAddListener(tblSelector, options, out);
  }
  /** Adds (or replaces) a single row in an existing table>tbody
   * NOTE: Row numbers use the rowIndex property of the row element.
   * @param {string|HTMLTableElement} tbl Either a CSS Selector for the table or a reference to the HTML Table Element
   * @param {object|Array} rowData A single row of column/cell data
   * @param {object} [options] Additional options
   * @param {number=} options.body Optional, default=0. The tbody section to add the row to.
   * @param {boolean=} options.allowHTML Optional, default=false. If true, allows HTML cell content, otherwise only allows text. Always sanitise HTML inputs
   * @param {string=} options.rowId Optional. HTML element ID for the added row
   * @param {number=} options.afterRow Optional. If provided, the new row will be added after this row number
   * @param {number=} options.beforeRow Optional. If provided, the new row will be added before this row number. Ignored if afterRow is provided
   * @param {number=} options.replaceRow Optional. If provided, the specified row will be REPLACED instead of added. Ignored if afterRow or beforeRow is provided
   * @param {Array<columnDefinition>} [options.cols] Optional. Data about each column. If not provided, will be calculated from the table
   *
   * @returns {HTMLTableRowElement} Reference to the newly added row. Use the `rowIndex` prop for the row number
   */
  tblAddRow(tbl, rowData = {}, options = {}) {
    return _ui.tblAddRow(tbl, rowData, options);
  }
  /** Remove a row from an existing table
   * @param {string|HTMLTableElement} tbl Either a CSS Selector for the table or a reference to the HTML Table Element
   * @param {number} rowIndex The row number to remove (1st row is 0, last row is -1)
   * @param {object} [options] Additional options
   *  @param {number=} options.body Optional, default=0. The tbody section to add the row to.
   */
  tblRemoveRow(tbl, rowIndex, options = {}) {
    _ui.tblRemoveRow(tbl, rowIndex, options);
  }
  /** Show a pop-over "toast" dialog or a modal alert
   * Refs: https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/alertdialog.html,
   *       https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/dialog.html,
   *       https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
   * @param {"notify"|"alert"} type Dialog type
   * @param {object} ui standardised ui data
   * @param {object} [msg] msg.payload/msg.topic - only used if a string. Optional.
   * @returns {void}
   */
  showDialog(type, ui, msg) {
    _ui.showDialog(type, ui, msg);
  }
  /** Directly manage UI via JSON
   * @param {object} json Either an object containing {_ui: {}} or simply simple {} containing ui instructions
   */
  ui(json) {
    _ui.ui(json);
  }
  /** Get data from the DOM. Returns selection of useful props unless a specific prop requested.
   * @param {string} cssSelector Identify the DOM element to get data from
   * @param {string} [propName] Optional. Specific name of property to get from the element
   * @returns {Array<*>} Array of objects containing either specific requested property or a selection of useful properties
   */
  uiGet(cssSelector, propName = null) {
    return _ui.uiGet(cssSelector, propName);
  }
  /** Enhance an HTML element that is being composed with ui data
   *  such as ID, attribs, event handlers, custom props, etc.
   * @param {*} el HTML Element to enhance
   * @param {*} component Individual uibuilder ui component spec
   */
  uiEnhanceElement(el, component) {
    _ui.uiEnhanceElement(el, component);
  }
  // #endregion -- direct to _ui --
  // ! TODO: Rework attrib handling to allow for uib-* and data-uib-* AND :* attributes
  //   See other bookmarks as well
  /** DOM Mutation observer callback to watch for new/amended elements with uib-* or data-uib-* attributes
   * WARNING: Mutation observers can receive a LOT of mutations very rapidly. So make sure this runs as fast
   *          as possible. Async so that calling function does not need to wait.
   * Observer is set up in the start() function
   * @param {MutationRecord[]} mutations Array of Mutation Records
   * @private
   */
  async _uibAttribObserver(mutations) {
    mutations.forEach(async (m) => {
      log("trace", "uibuilder:_uibAttribObserver", "Mutations ", m)();
      if (m.attributeName && (m.attributeName.startsWith("uib") || m.attributeName.startsWith("data-uib"))) {
        this._uibAttrScanOne(m.target);
      } else if (m.addedNodes.length > 0) {
        m.addedNodes.forEach(async (n) => {
          let aNames = [];
          try {
            aNames = [...n.attributes];
          } catch (e) {
          }
          const intersect = this.arrayIntersect(this.uibAttribs, aNames);
          intersect.forEach(async (el) => {
            this._uibAttrScanOne(el);
          });
          let uibChildren = [];
          if (n.querySelectorAll) uibChildren = n.querySelectorAll(__privateGet(this, _uibAttrSel));
          uibChildren.forEach(async (el) => {
            this._uibAttrScanOne(el);
          });
        });
      }
    });
  }
  _processUibTopic(el, topic) {
    this.onTopic(topic, (msg) => {
      log("trace", "uibuilder:_uibAttrScanOne", 'Msg with topic "'.concat(topic, '" received. msg content: '), msg)();
      msg._uib_processed_by = "_uibAttrScanOne";
      if (Object.prototype.hasOwnProperty.call(msg, "attributes")) {
        try {
          for (const [k, v] of Object.entries(msg.attributes)) {
            el.setAttribute(k, v);
          }
        } catch (e) {
          log(0, "uibuilder:attribute-processing", "Failed to set attributes. Ensure that msg.attributes is an object containing key/value pairs with each key a valid attribute name. Note that attribute values have to be a string.")();
        }
      }
      if (Object.prototype.hasOwnProperty.call(msg, "dataset")) {
        console.log("uibuilder:dataset-processing", "Processing dataset for element", el, msg.dataset);
        try {
          for (const [key, value2] of Object.entries(msg.dataset)) {
            el.dataset[key] = value2;
          }
        } catch (e) {
          log("error", "uibuilder:dataset-processing", "Failed to set dataset. Ensure that msg.dataset is an object containing key/value pairs with each key a valid dataset name. Note that dataset values have to be a string.")();
        }
      }
      const hasChecked = Object.prototype.hasOwnProperty.call(msg, "checked");
      const hasValue = Object.prototype.hasOwnProperty.call(msg, "value");
      if (hasValue || hasChecked) {
        if (el.type && (el.type === "checkbox" || el.type === "radio")) {
          if (hasChecked) el.checked = this.truthy(msg.checked, false);
          else if (hasValue) el.checked = this.truthy(msg.value, false);
        } else {
          if (hasValue) el.value = msg.value;
          else if (hasChecked) el.value = this.truthy(msg.checked, false);
        }
      }
      if (Object.prototype.hasOwnProperty.call(msg, "payload")) this.replaceSlot(el, msg.payload);
    });
  }
  /** Check a single HTML element for uib attributes and add auto-processors as needed.
   * Async so that calling function does not need to wait.
   * Understands only uib-topic at present. Msgs received on the topic can have:
   *   msg.payload - replaces innerHTML (but also runs <script>s and applies <style>s)
   *   msg.attributes - An object containing attribute names as keys with attribute values as values. e.g. {title: 'HTML tooltip', href='#route03'}
   * @param {Element} el HTML Element to check for uib-* or data-uib-* attributes
   * @private
   */
  async _uibAttrScanOne(el) {
    log("trace", "uibuilder:_uibAttrScanOne", "Setting up auto-processor for: ", el)();
    if (!el || !el.attributes) {
      return;
    }
    let uibAttribs = [...el.attributes].filter((attr) => attr.name.startsWith("uib-") || attr.name.startsWith("data-uib-") || attr.name.startsWith(":"));
    if (uibAttribs.length === 0) {
      return;
    }
    uibAttribs = [...new Set(uibAttribs)];
    uibAttribs.forEach((attr) => {
      var _a3;
      if ((attr == null ? void 0 : attr.name) === "uib-topic" || (attr == null ? void 0 : attr.name) === "data-uib-topic") this._processUibTopic(el, attr.value);
      else if ((attr == null ? void 0 : attr.name.startsWith("uib-bind:")) || (attr == null ? void 0 : attr.name.startsWith("data-uib-bind:")) || (attr == null ? void 0 : attr.name.startsWith(":"))) {
        const bindName = attr.name.replace(/^(uib-bind:|data-uib-bind:|:)/, "");
        let value2 = attr.value;
        try {
          value2 = new Function("return (".concat(attr.value, ")"))();
          log("print", "uibuilder:_uibAttrScanOne", "SUCCESS 1 uib-bind attribute:", bindName, "with value:", value2)();
        } catch (e) {
          log("print", "uibuilder:_uibAttrScanOne", "\u{1F7E5}Error 1 uib-bind attribute:", bindName, "with value:", value2)();
          try {
            console.log(globalThis);
            value2 = (_a3 = globalThis[attr.value]) != null ? _a3 : attr.value;
            log("print", "uibuilder:_uibAttrScanOne", "SUCCESS 2 uib-bind attribute:", bindName, "with value:", value2)();
          } catch (e2) {
            log("print", "uibuilder:_uibAttrScanOne", "\u{1F7E5}Error 2 uib-bind attribute:", bindName, "with value:", value2)();
          }
        }
        if (bindName && value2) {
          el.setAttribute(bindName, value2);
          if (bindName === "value") el.value = value2;
        } else {
          log("warn", "uibuilder:_uibAttrScanOne", "Invalid uib-bind attribute:", attr.name, "with value:", value2, "for element:", el)();
        }
      }
    });
  }
  /** Check all children of an array of or a single HTML element(s) for uib attributes and add auto-processors as needed.
   * Async so that calling function does not need to wait.
   * @param {Element|Element[]} parentEl HTML Element to check for uib-* or data-uib-* attributes
   * @private
   */
  async _uibAttrScanAll(parentEl) {
    if (!Array.isArray(parentEl)) parentEl = [parentEl];
    parentEl.forEach(async (p) => {
      const uibChildren = p.querySelectorAll(__privateGet(this, _uibAttrSel));
      if (uibChildren.length > 0) {
        uibChildren.forEach((el) => {
          this._uibAttrScanOne(el);
        });
      }
    });
  }
  /** Given a FileList array, send each file to Node-RED and return file metadata
   * @param {HTMLInputElement} srcEl Reference to the source input element
   * @param {boolean=} noSend If true, don't send the file to Node-RED. Default is to send.
   * @returns {Array<object>} Metadata values from all files
   * @private
   */
  _processFilesInput(srcEl, noSend = false) {
    const value2 = [];
    const files = srcEl.files;
    const seqCount = files.length;
    let seq = 0;
    for (const file of files) {
      const props = {};
      seq++;
      for (const prop in file) {
        props[prop] = file[prop];
      }
      props.tempUrl = window.URL.createObjectURL(file);
      value2.push(props);
      const meta = { seq, seqCount };
      meta.id = srcEl.id;
      if (srcEl.form) meta.formId = srcEl.form.id;
      meta.tempUrl = props.tempUrl;
      meta.data = srcEl.dataset;
      if (noSend !== true) this.uploadFile(file, meta);
    }
    return value2;
  }
  /** Easy creation/change of DOM elements, @see ./tinyDom.js */
  // dom = dom
  /** Attempt to get target attributs - can fail for certain target types, if so, returns empty object
   * @param {HTMLElement} el Target element
   * @returns {object} Array of key/value HTML attribute objects
   */
  getElementAttributes(el) {
    const ignoreAttribs = ["class", "id", "name"];
    let attribs;
    try {
      attribs = Object.assign(
        {},
        ...Array.from(
          el.attributes,
          ({ name: name2, value: value2 }) => {
            if (!ignoreAttribs.includes(name2)) {
              return { [name2]: value2 };
            }
            return void 0;
          }
        )
      );
    } catch (e) {
    }
    return attribs;
  }
  /** Check for CSS Classes and return as array if found or undefined if not
   * @param {HTMLElement} el Target element
   * @returns {Array|undefined} Array of class names
   */
  getElementClasses(el) {
    let classes;
    try {
      classes = Array.from(el.classList);
    } catch (e) {
    }
    return classes;
  }
  /** Get target custom properties - only shows custom props not element default ones
   * Excludes custom props starting with _
   * @param {HTMLElement} el Target element
   * @returns {object} Object of propname/value pairs
   */
  getElementCustomProps(el) {
    const props = {};
    Object.keys(el).forEach((key) => {
      if (key.startsWith("_")) return;
      props[key] = el[key];
    });
    return props;
  }
  /** Check for el.value and el.checked. el.checked will also set the value return for ease of use.
   * Only 2 input types use el.checked, different from all other input types - this is annoying.
   * @param {HTMLElement} el HTML Element to be checked
   * @returns {{value:boolean|null, checked:boolean|null}} Return null if properties not present, else the appropriate value
   */
  getFormElementValue(el) {
    let value2 = null;
    let checked = null;
    switch (el.type) {
      case "checkbox":
      case "radio": {
        value2 = checked = el.checked;
        break;
      }
      case "select-multiple": {
        value2 = Array.from(el.selectedOptions).map((option) => option.value);
        break;
      }
      default: {
        if (el.value) value2 = el.value;
        if (el.checked) {
          value2 = checked = el.checked;
        }
        if (el.valueAsNumber && !isNaN(el.valueAsNumber)) {
          value2 = el.valueAsNumber;
        }
        break;
      }
    }
    return { value: value2, checked };
  }
  // ! TODO - Handle fieldsets
  /** For HTML Form elements (e.g. input, textarea, select), return the details
   * @param {HTMLFormElement} el Source form element
   * @returns {object|null} Form element key details
   */
  getFormElementDetails(el) {
    if (!el.type) {
      log(1, "uibuilder:getFormElementDetails", "Cannot get form element details as this is not an input type element")();
      return null;
    }
    const id = this.returnElementId(el);
    if (!id) {
      log(1, "uibuilder:getFormElementDetails", "Cannot get form element details as no id is present and could not be generated")();
      return null;
    }
    let { value: value2, checked } = this.getFormElementValue(el);
    const formDetails = {
      id,
      name: el.name,
      valid: el.checkValidity(),
      type: el.type
    };
    if (value2 !== null) formDetails.value = value2;
    if (checked !== null) formDetails.checked = checked;
    if (formDetails.valid === false) {
      const v = el.validity;
      formDetails.validity = {
        badInput: v.badInput === true ? v.badInput : void 0,
        customError: v.customError === true ? v.customError : void 0,
        patternMismatch: v.patternMismatch === true ? v.patternMismatch : void 0,
        rangeOverflow: v.rangeOverflow === true ? v.rangeOverflow : void 0,
        rangeUnderflow: v.rangeUnderflow === true ? v.rangeUnderflow : void 0,
        stepMismatch: v.stepMismatch === true ? v.stepMismatch : void 0,
        tooLong: v.tooLong === true ? v.tooLong : void 0,
        tooShort: v.tooShort === true ? v.tooShort : void 0,
        typeMismatch: v.typeMismatch === true ? v.typeMismatch : void 0,
        valueMissing: v.valueMissing === true ? v.valueMissing : void 0
      };
    }
    if (Object.keys(el.dataset).length > 0) formDetails.data = el.dataset;
    return formDetails;
  }
  /** Show a browser notification if possible.
   * Config can be a simple string, a Node-RED msg (topic as title, payload as body)
   * or a Notifications API options object + config.title string.
   * @example uibuilder.notify( 'My simple message to the user' )
   * @example uibuilder.notify( {topic: 'My Title', payload: 'My simple message to the user'} )
   * @example uibuilder.notify( {title: 'My Title', body: 'My simple message to the user'} )
   * @example // If config.return = true, a promise is returned.
   * // The resolved promise is only returned if the notification is clicked by the user.
   * // Can be used to send the response back to Node-RED
   * uibuilder.notify(notifyConfig).then( res => uibuilder.eventSend(res) )
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
   * @param {object|string} config Notification config data or simple message string
   * @returns {Promise<Event>|null} A promise that resolves to the click event or null
   */
  notify(config) {
    if (config.return) return _ui.notification(config);
    _ui.notification(config).then((res) => {
      log("info", "Uib:notification", "Notification completed event", res)();
    }).catch((err) => {
      log("error", "Uib:notification", "Notification error event", err)();
    });
    return null;
  }
  /** Get or create a (hopefully) unique ID
   * @param {HTMLFormElement} el Source form element
   * @returns {string|null} A hopefully unique element ID
   */
  returnElementId(el) {
    return el.id !== "" ? el.id : el.name !== "" ? "".concat(el.name, "-").concat(++__privateWrapper(this, _uniqueElID)._) : el.type ? "".concat(el.type, "-").concat(++__privateWrapper(this, _uniqueElID)._) : "".concat(el.localName, "-").concat(++__privateWrapper(this, _uniqueElID)._);
  }
  /** Scroll the page
   * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
   * @param {string} [cssSelector] Optional. If not set, scrolls to top of page.
   * @param {{block:(string|undefined),inline:(string|undefined),behavior:(string|undefined)}} [opts] Optional. DOM scrollIntoView options
   * @returns {boolean} True if element was found, false otherwise
   */
  scrollTo(cssSelector, opts) {
    if (!opts) opts = {};
    if (!cssSelector || cssSelector === "top" || cssSelector === "start") cssSelector = "body";
    else if (cssSelector === "bottom" || cssSelector === "end") {
      cssSelector = "body";
      opts.block = "end";
    }
    const el = this.$(cssSelector);
    if (el) {
      el.scrollIntoView(opts);
      return true;
    }
    return false;
  }
  /** Show/hide a display card on the end of the visible HTML that will dynamically display the last incoming msg from Node-RED
   * The card has the id `uib_last_msg`. Updates are done from a listener set up in the start function.
   * @param {boolean|undefined} showHide true=show, false=hide. undefined=toggle.
   * @param {string|undefined} parent Optional. If not undefined, a CSS selector to attach the display to. Defaults to `body`
   * @returns {boolean} New state
   */
  showMsg(showHide, parent = "body") {
    if (showHide === void 0) showHide = !__privateGet(this, _isShowMsg);
    __privateSet(this, _isShowMsg, showHide);
    let slot = "Waiting for a message from Node-RED";
    if (this.msg && Object.keys(this.msg).length > 0) {
      slot = this.syntaxHighlight(this.msg);
    }
    if (showHide === false) {
      _ui._uiRemove({
        components: [
          "#uib_last_msg_wrap"
        ]
      });
    } else {
      _ui._uiReplace({
        components: [
          {
            type: "div",
            id: "uib_last_msg_wrap",
            parent,
            attributes: {
              title: "Last message from Node-RED"
            },
            components: [
              {
                type: "button",
                attributes: {
                  onclick: 'uibuilder.copyToClipboard("msg")',
                  class: "compact",
                  style: "right:3em;"
                },
                slot: "\u{1F4CB}"
              },
              {
                type: "button",
                attributes: {
                  onclick: "uibuilder.showMsg()",
                  class: "compact",
                  style: "right:.5em;"
                },
                slot: "\u26D4"
              },
              {
                type: "pre",
                id: "uib_last_msg",
                // parent: 'uib_last_msg_wrap',
                attributes: {
                  class: "syntax-highlight"
                },
                slot
              }
            ]
          }
        ]
      });
    }
    return showHide;
  }
  /** Show/hide a display card on the end of the visible HTML that will dynamically display the current status of the uibuilder client
   * The card has the id `uib_status`.
   * The display is updated by an event listener created in the class constructor.
   * @param {boolean|undefined} showHide true=show, false=hide. undefined=toggle.
   * @param {string|undefined} parent Optional. If not undefined, a CSS selector to attach the display to. Defaults to `body`
   * @returns {boolean} New state
   */
  showStatus(showHide, parent = "body") {
    if (showHide === void 0) showHide = !__privateGet(this, _isShowStatus);
    __privateSet(this, _isShowStatus, showHide);
    if (showHide === false) {
      _ui._uiRemove({
        components: [
          "#uib_status"
        ]
      });
      return showHide;
    }
    const root = {
      components: [
        {
          type: "div",
          id: "uib_status",
          parent,
          attributes: {
            title: "Current status of the uibuilder client",
            class: "text-smaller"
          },
          components: [
            {
              type: "table",
              components: [
                {
                  type: "tbody",
                  components: []
                }
              ]
            }
          ]
        }
      ]
    };
    const details = root.components[0].components[0].components[0].components;
    Object.values(__privateGet(this, _showStatus)).forEach((entry) => {
      details.push({
        type: "tr",
        attributes: {
          title: entry.description
        },
        components: [
          {
            type: "th",
            slot: entry.label
          },
          {
            type: "td",
            attributes: {
              "data-varType": entry.var
            },
            slot: entry.var === "version" ? _a2._meta.version : JSON.stringify(this[entry.var])
          }
        ]
      });
    });
    _ui._uiReplace(root);
    return showHide;
  }
  /** Use the Mutation Observer browser API to watch for changes to a single element on the page.
   * OMG! It is sooo hard to turn the data into something that successfully serialises so it can be sent back to Node-RED!
   * NB: Each cssSelector creates a unique watcher. Sending the same selector overwrites the previous one.
   * @param {string} cssSelector A CSS Selector that selects the element to watch for changes
   * @param {boolean|"toggle"} [startStop] true=start watching the DOM, false=stop. Default='toggle'
   * @param {boolean} [send] true=Send changes to Node-RED, false=Don't send. Default=true
   * @param {boolean} [showLog] true=Output changes to log, false=stop. Default=true. Log level is 2 (Info)
   * @returns {boolean} True if the watch is on, false otherwise
   */
  uiWatch(cssSelector, startStop = "toggle", send = true, showLog = true) {
    const targetNode = document.querySelector(cssSelector);
    if (!targetNode) {
      log("warn", "uibuilder.module.js:uiWatch", "CSS Selector '".concat(cssSelector, "' not found."))();
      return false;
    }
    if (startStop === "toggle" || startStop === void 0 || startStop === null) {
      if (__privateGet(this, _uiObservers)[cssSelector]) startStop = false;
      else startStop = true;
    }
    const that = this;
    if (startStop === true) {
      __privateGet(this, _uiObservers)[cssSelector] = new MutationObserver(function(mutationList) {
        const out = [];
        mutationList.forEach((mu) => {
          const oMu = {
            type: mu.type,
            oldValue: mu.oldValue !== null ? mu.oldValue : void 0
          };
          if (mu.addedNodes.length > 0) {
            oMu.addedNodes = [];
            mu.addedNodes.forEach((an, i) => {
              oMu.addedNodes.push(_ui.nodeGet(mu.addedNodes[i]));
            });
          }
          if (mu.removedNodes.length > 0) {
            oMu.removedNodes = [];
            mu.removedNodes.forEach((an, i) => {
              oMu.removedNodes.push(_ui.nodeGet(mu.removedNodes[i]));
            });
          }
          if (mu.type === "attributes") {
            oMu.attributeName = mu.attributeName;
            oMu.newValue = mu.target.attributes[mu.attributeName].value;
          }
          out.push(oMu);
        });
        that._dispatchCustomEvent("uibuilder:domChange", out);
        if (send === true) {
          that.send({
            _ui: {
              cssSelector,
              uiChanges: out
            },
            topic: that.topic || "DOM Changes for '".concat(cssSelector, "'")
          });
        }
        if (showLog === true) {
          log("info", "uibuilder.module.js:uiWatch", "DOM Changes for '".concat(cssSelector, "'"), { uiChanges: out }, { mutationList })();
        }
      });
      __privateGet(this, _uiObservers)[cssSelector].observe(targetNode, { attributes: true, childList: true, subtree: true, characterData: true });
      log("trace", "uibuilder.module.js:uiWatch", "Started Watching DOM changes for '".concat(cssSelector, "'"))();
    } else {
      __privateGet(this, _uiObservers)[cssSelector].disconnect();
      delete __privateGet(this, _uiObservers)[cssSelector];
      log("trace", "uibuilder.module.js:uiWatch", "Stopped Watching DOM changes for '".concat(cssSelector, "'"))();
    }
    return startStop;
  }
  // ---- End of watchDom ---- //
  /** Use the Mutation Observer browser API to watch for and save changes to the HTML
   * Once the observer is created, it will be reused.
   * Sending true or undefined will turn on the observer, false turns it off.
   * saveHtmlCache is called whenever anything changes in the dom. This allows
   * users to call restoreHtmlFromCache() on page load if desired to completely reload
   * to the last saved state.
   * @param {boolean} startStop true=start watching the DOM, false=stop
   */
  watchDom(startStop) {
    const targetNode = document.documentElement;
    const that = this;
    if (!this._htmlObserver) {
      this._htmlObserver = new MutationObserver(function() {
        this.takeRecords();
        that.saveHtmlCache();
      });
    }
    if (startStop === true || startStop === void 0) {
      this._htmlObserver.observe(targetNode, { attributes: true, childList: true, subtree: true, characterData: true });
      log("trace", "uibuilder.module.js:watchDom", "Started Watching and saving DOM changes")();
    } else {
      this._htmlObserver.disconnect();
      log("trace", "uibuilder.module.js:watchDom", "Stopped Watching and saving DOM changes")();
    }
  }
  // ---- End of watchDom ---- //
  // #endregion -------- -------- -------- //
  // #region ------- HTML cache --------- //
  /** Clear the saved DOM from localStorage */
  clearHtmlCache() {
    this.removeStore("htmlCache");
    log("trace", "uibuilder.module.js:clearHtmlCache", "HTML cache cleared")();
  }
  /** Restore the complete DOM (the whole web page) from browser localStorage if available */
  restoreHtmlFromCache() {
    const htmlCache = this.getStore("htmlCache");
    if (htmlCache) {
      const targetNode = document.getElementsByTagName("html")[0];
      targetNode.innerHTML = htmlCache;
      log("trace", "uibuilder.module.js:restoreHtmlFromCache", "Restored HTML from cache")();
    } else {
      log("trace", "uibuilder.module.js:restoreHtmlFromCache", "No cache to restore")();
    }
  }
  /** Save the current DOM state to browser localStorage.
   * localStorage is persistent and so can be recovered even after a browser restart.
   */
  saveHtmlCache() {
    this.setStore("htmlCache", document.documentElement.innerHTML);
  }
  // #endregion -------- -------- -------- //
  // #region ------- Message Handling (To/From Node-RED) -------- //
  /** Handles original control msgs (not to be confused with "new" msg._uib controls)
   * @param {*} receivedCtrlMsg The msg received on the socket.io control channel
   * @private
   */
  _ctrlMsgFromServer(receivedCtrlMsg) {
    if (receivedCtrlMsg === null) {
      receivedCtrlMsg = {};
    } else if (typeof receivedCtrlMsg !== "object") {
      const msg = {};
      msg["uibuilderCtrl:" + this._ioChannels.control] = receivedCtrlMsg;
      receivedCtrlMsg = msg;
    }
    this._checkTimestamp(receivedCtrlMsg);
    this.set("ctrlMsg", receivedCtrlMsg);
    this.set("msgsCtrlReceived", ++this.msgsCtrlReceived);
    log("trace", "Uib:ioSetup:_ctrlMsgFromServer", "Channel '".concat(this._ioChannels.control, "'. Received control msg #").concat(this.msgsCtrlReceived), receivedCtrlMsg)();
    switch (receivedCtrlMsg.uibuilderCtrl) {
      // Node-RED is shutting down
      case "shutdown": {
        log("info", "Uib:ioSetup:".concat(this._ioChannels.control), '\u274C Received "shutdown" from server')();
        this.set("serverShutdown", void 0);
        break;
      }
      /** We are connected to the server - 1st msg from server */
      case "client connect": {
        log("trace", "Uib:ioSetup:".concat(this._ioChannels.control), 'Received "client connect" from server', receivedCtrlMsg)();
        log("info", "Uib:ioSetup:".concat(this._ioChannels.control), "\u2705 Server connected. Version: ".concat(receivedCtrlMsg.version, "\nServer time: ").concat(receivedCtrlMsg.serverTimestamp, ", Sever time offset: ").concat(this.serverTimeOffset, " hours. Max msg size: ").concat(receivedCtrlMsg.maxHttpBufferSize))();
        if (!_a2._meta.version.startsWith(receivedCtrlMsg.version.split("-")[0])) {
          log("warn", "Uib:ioSetup:".concat(this._ioChannels.control), "Server version (".concat(receivedCtrlMsg.version, ") not the same as the client version (").concat(_a2._meta.version, ")"))();
        }
        if (this.autoSendReady === true) {
          log("trace", "Uib:ioSetup:".concat(this._ioChannels.control, "/client connect"), "Auto-sending ready-for-content/replay msg to server");
        }
        this.maxHttpBufferSize = receivedCtrlMsg.maxHttpBufferSize;
        break;
      }
      // We requested this page's metadata from the server using getPageMeta() - this handles the response
      case "get page meta": {
        this.set("pageMeta", receivedCtrlMsg.payload);
        break;
      }
      default: {
        log("trace", "uibuilder:ioSetup:".concat(this._ioChannels.control), "Received ".concat(receivedCtrlMsg.uibuilderCtrl, " from server"));
      }
    }
  }
  // -- End of websocket receive CONTROL msg from Node-RED -- //
  /** Do we want to process something? Check pageName, clientId, tabId. Defaults to yes.
   * @param {*} obj Either a msg._ui or msg._uib object to check
   * @returns {boolean} True if we should process the inbound _ui/_uib msg, false if not.
   * @private
   */
  _forThis(obj) {
    let r = true;
    if (obj.pageName && obj.pageName !== this.pageName) {
      log("trace", "Uib:_msgRcvdEvents:_uib", "Not for this page")();
      r = false;
    }
    if (obj.clientId && obj.clientId !== this.clientId) {
      log("trace", "Uib:_msgRcvdEvents:_uib", "Not for this clientId")();
      r = false;
    }
    if (obj.tabId && obj.tabId !== this.tabId) {
      log("trace", "Uib:_msgRcvdEvents:_uib", "Not for this tabId")();
      r = false;
    }
    return r;
  }
  /** Handle received messages - Process some msgs internally, emit specific events on document that make it easy for coders to use
   * @param {object} msg The message received from Node-RED
   * @private
   */
  _msgRcvdEvents(msg) {
    this._dispatchCustomEvent("uibuilder:stdMsgReceived", msg);
    if (msg.topic) this._dispatchCustomEvent("uibuilder:msg:topic:".concat(msg.topic), msg);
    if (msg._uib_processed_by) return;
    msg._uib_processed_by = "_msgRcvdEvents";
    if (msg._uib) {
      if (!this._forThis(msg._uib)) return;
      if (msg._uib.reload === true) {
        log("trace", "Uib:_msgRcvdEvents:_uib:reload", "reloading")();
        msg._uib_processed_by = "_msgRcvdEvents - reload";
        location.reload();
        return;
      }
      if (msg._uib.command) {
        msg._uib_processed_by = "_msgRcvdEvents - remote command";
        this._uibCommand(msg);
        return;
      }
      if (msg._uib.componentRef === "globalNotification") {
        msg._uib_processed_by = "_msgRcvdEvents - globalNotification";
        _ui.showDialog("notify", msg._uib.options, msg);
      }
      if (msg._uib.componentRef === "globalAlert") {
        msg._uib_processed_by = "_msgRcvdEvents - globalAlert";
        _ui.showDialog("alert", msg._uib.options, msg);
      }
    }
    if (msg._ui) {
      if (!this._forThis(msg._ui)) return;
      log("trace", "Uib:_msgRcvdEvents:_ui", "Calling _uiManager")();
      msg._uib_processed_by = "_msgRcvdEvents - _ui";
      this._dispatchCustomEvent("uibuilder:msg:_ui", msg);
      _ui._uiManager(msg);
    }
  }
  // --- end of _msgRcvdEvents ---
  /** Internal send fn. Send a standard or control msg back to Node-RED via Socket.IO
   * NR will generally expect the msg to contain a payload topic
   * @param {object} msgToSend The msg object to send.
   * @param {string} [channel] The Socket.IO channel to use, must be in self.ioChannels or it will be ignored. Default=uiBuilderClient
   * @param {string} [originator] A Node-RED node ID to return the message to. Default=''
   * @private
   */
  _send(msgToSend, channel, originator = "") {
    if (channel === null || channel === void 0) channel = this._ioChannels.client;
    if (channel === this._ioChannels.client) {
      msgToSend = this.makeMeAnObject(msgToSend, "payload");
      if (this.hasUibRouter()) {
        if (!msgToSend._uib) msgToSend._uib = {};
        msgToSend._uib.routeId = this.uibrouter_CurrentRoute;
      }
    } else if (channel === this._ioChannels.control) {
      msgToSend = this.makeMeAnObject(msgToSend, "uibuilderCtrl");
      if (!Object.prototype.hasOwnProperty.call(msgToSend, "uibuilderCtrl")) {
        msgToSend.uibuilderCtrl = "manual send";
      }
      msgToSend.from = "client";
      if (this.hasUibRouter()) msgToSend.routeId = this.uibrouter_CurrentRoute;
    }
    msgToSend._socketId = this._socket.id;
    if (originator === "" && this.originator !== "") originator = this.originator;
    if (originator !== "") Object.assign(msgToSend, { _uib: { originator } });
    if (!Object.prototype.hasOwnProperty.call(msgToSend, "topic")) {
      if (this.topic !== void 0 && this.topic !== "") msgToSend.topic = this.topic;
      else {
        if (Object.prototype.hasOwnProperty.call(this, "msg") && Object.prototype.hasOwnProperty.call(this.msg, "topic")) {
          msgToSend.topic = this.msg.topic;
        }
      }
    }
    if (msgToSend._ui) {
      msgToSend._ui.from = "client";
      if (this.hasUibRouter()) msgToSend._ui.routeId = this.uibrouter_CurrentRoute;
    }
    let numMsgs;
    if (channel === this._ioChannels.client) {
      this.set("sentMsg", msgToSend);
      numMsgs = this.set("msgsSent", ++this.msgsSent);
    } else if (channel === this._ioChannels.control) {
      this.set("sentCtrlMsg", msgToSend);
      numMsgs = this.set("msgsSentCtrl", ++this.msgsSentCtrl);
    }
    log("trace", "Uib:_send", " Channel '".concat(channel, "'. Sending msg #").concat(numMsgs), msgToSend)();
    this._socket.emit(channel, msgToSend);
  }
  // --- End of Send Msg Fn --- //
  /** Callback handler for messages from Node-RED
   * NOTE: `this` is the class here rather the `socket` as would be normal since we bind the correct `this` in the call.
   *       Use this._socket if needing reference to the socket.
   * @callback ioSetupFromServer Called from ioSetup/this._socket.on(this.#ioChannels.server, this.stdMsgFromServer.bind(this))
   * @param {object} receivedMsg The msg object from Node-RED
   * @this Uib
   * @private
   */
  _stdMsgFromServer(receivedMsg) {
    receivedMsg = this.makeMeAnObject(receivedMsg, "payload");
    if (receivedMsg._uib && !this._forThis(receivedMsg._uib)) return;
    if (receivedMsg._ui && !this._forThis(receivedMsg._ui)) return;
    this._checkTimestamp(receivedMsg);
    this.set("msgsReceived", ++this.msgsReceived);
    this._msgRcvdEvents(receivedMsg);
    if (!("_ui" in receivedMsg && !("payload" in receivedMsg))) {
      this.set("msg", receivedMsg);
    }
    log("info", "Uib:ioSetup:stdMsgFromServer", "Channel '".concat(this._ioChannels.server, "'. Received msg #").concat(this.msgsReceived, "."), receivedMsg)();
  }
  // -- End of websocket receive DATA msg from Node-RED -- //
  /** Process msg._uib.command - Remember to update #extCommands with new allowed commands
   * @param {object} msg Msg from Node-RED containing a msg._uib object
   * @private
   */
  _uibCommand(msg) {
    var _a3;
    if (!msg._uib || !msg._uib.command) {
      log("error", "uibuilder:_uibCommand", "Invalid command message received", { msg })();
      msg.payload = msg.error = "Invalid command message received";
      this.send(msg);
      return;
    }
    const cmd = msg._uib.command;
    if (!__privateGet(this, _extCommands).includes(cmd.trim())) {
      log("error", "Uib:_uibCommand", "Command '".concat(cmd, " is not allowed to be called externally"))();
      return;
    }
    const prop = msg._uib.prop;
    const value2 = msg._uib.value;
    const quiet = (_a3 = msg._uib.quiet) != null ? _a3 : false;
    let response, info;
    switch (cmd) {
      // case 'elementIsVisible': { // temporarily deprecated
      //     response = this.elementIsVisible(prop)
      //     // info = `Element "${prop}" ${response ? 'is visible' : 'is not visible'}`
      //     break
      // }
      case "elementExists": {
        response = this.elementExists(prop, false);
        info = 'Element "'.concat(prop, '" ').concat(response ? "exists" : "does not exist");
        break;
      }
      case "get": {
        response = this.get(prop);
        break;
      }
      case "getManagedVarList": {
        if (prop === "full") response = this.getManagedVarList();
        else response = Object.values(this.getManagedVarList());
        break;
      }
      case "getWatchedVars": {
        if (prop === "full") response = this.getWatchedVars();
        else response = Object.values(this.getWatchedVars());
        break;
      }
      case "sendHtml":
      case "htmlSend": {
        response = this.htmlSend("", false);
        break;
      }
      case "include": {
        response = _ui.include(prop, value2);
        break;
      }
      case "navigate": {
        let newUrl;
        if (prop) newUrl = prop;
        else if (value2) newUrl = value2;
        response = this.navigate(newUrl);
        break;
      }
      case "scrollTo": {
        response = this.scrollTo(prop, value2);
        break;
      }
      case "set": {
        let store = false;
        let autoload = false;
        if (msg._uib.options && msg._uib.options.store) {
          if (msg._uib.options.store === true) store = true;
          if (msg._uib.options.autoload === true) autoload = true;
        }
        response = this.set(prop, value2, store, autoload);
        break;
      }
      case "showMsg": {
        response = this.showMsg(value2, prop);
        break;
      }
      case "showStatus": {
        response = this.showStatus(value2, prop);
        break;
      }
      case "uiGet": {
        response = _ui.uiGet(prop, value2);
        break;
      }
      case "uiWatch": {
        response = this.uiWatch(prop);
        break;
      }
      case "watchUrlHash": {
        response = this.watchUrlHash(prop);
        break;
      }
      default: {
        log("warning", "Uib:_uibCommand", "Command '".concat(cmd, "' not yet implemented"))();
        break;
      }
    }
    if (quiet !== true) {
      if (response === void 0) {
        response = "'".concat(prop, "' is undefined");
      }
      if (Object(response).constructor === Promise) {
        response.then((data) => {
          msg.payload = msg._uib.response = data;
          msg.info = msg._uib.info = info;
          if (!msg.topic) msg.topic = this.topic || "uib ".concat(cmd, " for '").concat(prop, "'");
          this.send(msg);
          return true;
        }).catch((err) => {
          log(0, "Uib:_uibCommand", "Error: ", err)();
        });
      } else {
        msg.payload = msg._uib.response = response;
        msg.info = msg._uib.info = info;
        if (!msg.topic) msg.topic = this.topic || "uib ".concat(cmd, " for '").concat(prop, "'");
        this.send(msg);
      }
    }
  }
  // --- end of _uibCommand ---
  /** Send log text to uibuilder's beacon endpoint (works even if socket.io not connected)
   * @param {string} txtToSend Text string to send
   * @param {string|undefined} logLevel Log level to use. If not supplied, will default to debug
   */
  beaconLog(txtToSend, logLevel) {
    if (!logLevel) logLevel = "debug";
    navigator.sendBeacon("./_clientLog", "".concat(logLevel, "::").concat(txtToSend));
  }
  /** Request the current page's metadata from the server - response is handled automatically in _ctrlMsgFromServer */
  getPageMeta() {
    this.sendCtrl({
      uibuilderCtrl: "get page meta"
    });
  }
  /** Easily send the entire DOM/HTML msg back to Node-RED
   * @param {string} [originator] A Node-RED node ID to return the message to
   * @param {boolean} [send] If true (default) directly send response to Node-RED. Is false when calling from Node-RED as a command.
   * @returns {string} The HTML as a string
   */
  htmlSend(originator = "", send = true) {
    const out = "<!doctype html>\n".concat(document.documentElement.outerHTML);
    const msg = {
      payload: out,
      length: out.length,
      topic: this.topic
    };
    log("trace", "Uib:htmlSend", "Sending full HTML to Node-RED", msg)();
    if (send === true) this._send(msg, this._ioChannels.client, originator);
    return out;
  }
  /** Send log info back to Node-RED over uibuilder's websocket control output (Port #2)
   * @param {...*} arguments All arguments passed to the function are added to the msg.payload
   */
  logToServer() {
    this.sendCtrl({
      uibuilderCtrl: "client log message",
      payload: arguments,
      // "version":"6.1.0-iife.min",
      _socketId: this._socket.id,
      // "ip":"::1",
      clientId: this.clientId,
      tabId: this.tabId,
      // "url":"esp-test",
      pageName: this.pageName,
      connections: this.connectedNum,
      lastNavType: this.lastNavType
    });
  }
  /** Easily send a msg back to Node-RED on a DOM event
   * @example In plain HTML/JavaScript
   *    `<button id="button1" name="button 1" data-fred="jim"></button>`
   *    $('#button1').onclick = (evt) => {
   *      uibuilder.eventSend(evt)
   *    }
   * @example
   * In VueJS: `<b-button id="myButton1" @click="doEvent" data-something="hello"></b-button>`
   * In VueJS methods: `doEvent: uibuilder.eventSend,`
   *
   * All `data-` attributes will be passed back to Node-RED,
   *    use them instead of arguments in the click function.
   *    All target._ui custom properties are also passed back to Node-RED.
   *
   * @param {MouseEvent|any} domevent DOM Event object
   * @param {string} [originator] A Node-RED node ID to return the message to
   */
  eventSend(domevent, originator = "") {
    if (this.$attrs) {
      log("error", "Uib:eventSend", "`this` has been usurped by VueJS. Make sure that you wrap the call in a function: `doEvent: function (event) { uibuilder.eventSend(event) },`")();
      return;
    }
    if (!domevent && !event) {
      log("warn", "Uib:eventSend", "Neither the domevent nor the hidden event properties are set. You probably called this function directly rather than applying to an on click event.")();
      return;
    }
    if (!domevent || !domevent.constructor) domevent = event;
    if (!domevent.constructor.name.endsWith("Event") || !domevent.currentTarget) {
      log("warn", "Uib:eventSend", "ARGUMENT NOT A DOM EVENT - use data attributes not function arguments to pass data. Arg Type: ".concat(domevent.constructor.name), domevent)();
      return;
    }
    domevent.preventDefault();
    const target = domevent.currentTarget;
    const props = this.getElementCustomProps(target);
    const attribs = this.getElementAttributes(target);
    let payload = {};
    let formDetails;
    if (target.form) {
      formDetails = {
        id: this.returnElementId(target.form),
        valid: target.form.checkValidity()
      };
      Object.values(target.form).forEach((frmEl, i) => {
        if (["fieldset", "object"].includes(frmEl.type)) return;
        const details = this.getFormElementDetails(frmEl);
        if (details) {
          if (frmEl.type === "file" && frmEl.files.length > 0) {
            details.value = this._processFilesInput(frmEl);
          }
          formDetails[details.id] = details;
          payload[details.id] = details.value;
        }
      });
    } else {
      if (target.type === "file") {
        payload = this._processFilesInput(target);
      }
    }
    const classes = this.getElementClasses(target);
    if (Object.keys(target.dataset).length > 0) payload = { ...payload, ...target.dataset };
    const { value: value2, checked } = this.getFormElementValue(target);
    if (value2 !== null) payload.value = value2;
    if (checked !== null) payload.checked = checked;
    let nprops;
    if (Object.prototype.toString.call(target) === "[object Notification]") {
      payload = "notification-".concat(target.userAction);
      nprops = {
        // userAction: target.userAction, // uib custom prop: click, close or error
        actions: target.actions,
        badge: target.badge,
        body: target.body,
        data: target.data,
        dir: target.dir,
        icon: target.icon,
        image: target.image,
        lang: target.lang,
        renotify: target.renotify,
        requireInteraction: target.requireInteraction,
        silent: target.silent,
        tag: target.tag,
        timestamp: target.timestamp,
        title: target.title,
        vibrate: target.vibrate
      };
    }
    const msg = {
      // - this may be an empty Object if no data attributes defined
      payload,
      _ui: {
        type: "eventSend",
        id: target.id !== "" ? target.id : void 0,
        name: target.name !== "" ? target.name : void 0,
        slotText: target.textContent ? target.textContent.substring(0, 255) : void 0,
        dataset: { ...target.dataset },
        form: formDetails,
        props,
        attribs,
        classes,
        notification: nprops,
        event: domevent.type,
        altKey: domevent.altKey,
        ctrlKey: domevent.ctrlKey,
        shiftKey: domevent.shiftKey,
        metaKey: domevent.metaKey,
        pointerType: domevent.pointerType,
        nodeName: target.nodeName,
        clientId: this.clientId,
        pageName: this.pageName,
        tabId: this.tabId
      }
    };
    log("trace", "Uib:eventSend", "Sending msg to Node-RED", msg)();
    this._send(msg, this._ioChannels.client, originator);
  }
  /** Send a standard message to NR
   * @example uibuilder.send({payload:'Hello'})
   * @param {object} msg Message to send
   * @param {string} [originator] A Node-RED node ID to return the message to
   */
  send(msg, originator = "") {
    this._send(msg, this._ioChannels.client, originator);
  }
  // ! TODO: Rooms do not auto-reconnect. Add tracking and update _onConnect
  // ! TODO: Add receipt handler on joining a room.
  // NOTE: Rooms only understood by server not client so we have to use custom emits
  //       They do not auto-reconnect
  /** Send a msg to a pre-defined Socket.IO room
   * @see https://socket.io/docs/v4/rooms/
   * @param {string} room Name of a Socket.IO pre-defined room.
   * @param {*} msg Message to send
   */
  sendRoom(room, msg) {
    this._socket.emit("uib-room-send", room, msg);
  }
  joinRoom(room) {
    this._socket.emit("uib-room-join", room);
  }
  leaveRoom(room) {
    this._socket.emit("uib-room-leave", room);
  }
  /** Send a control msg to NR
   * @param {object} msg Message to send
   */
  sendCtrl(msg) {
    this._send(msg, this._ioChannels.control);
  }
  /**
   * Send a message to Node-RED on a custom channel - use for UIBUILDER 3rd-party custom nodes
   * @param {string} channel The custom channel name to use
   * @param {object} msg The message to send
   */
  sendCustom(channel, msg) {
    this._socket.emit(channel, msg);
  }
  /** Upload a file to Node-RED over Socket.IO
   * https://developer.mozilla.org/en-US/docs/Web/API/FileReader
   * @param {File} file Reference to File API object to upload
   * @param {object} [meta] Optiona. Additional metadata to send with the file
   */
  uploadFile(file, meta) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const msg = {
        topic: this.topic || "file-upload",
        payload: arrayBuffer,
        fileName: file.name,
        type: file.type,
        lastModified: file.lastModifiedDate,
        size: file.size,
        clientId: this.clientId,
        pageName: this.pageName,
        tabId: this.tabId,
        ...meta
      };
      const maxSize = this.maxHttpBufferSize - 500;
      if (arrayBuffer.byteLength >= maxSize) {
        msg.payload = void 0;
        msg.error = "File is too large to send. File size: ".concat(arrayBuffer.byteLength, ". Max msg size: ").concat(maxSize);
        log("error", "Uib:uploadFile", msg.error)();
      }
      this.send(msg);
    };
    reader.readAsArrayBuffer(file);
  }
  // #endregion -------- ------------ -------- //
  // #region ------- Socket.IO -------- //
  /** Return the Socket.IO namespace
   * The cookie method is the most reliable but this falls back to trying to work it
   * out from the URL if cookies not available. That won't work if page is in a sub-folder.
   * since 2017-10-21 Improve method to cope with more complex paths - thanks to Steve Rickus @shrickus
   * since 2017-11-10 v1.0.1 Check cookie first then url. cookie works even if the path is more complex (e.g. sub-folder)
   * since 2020-01-25 Removed httpRoot from namespace to prevent proxy induced errors
   * @returns {string} Socket.IO namespace
   * @private
   */
  _getIOnamespace() {
    let ioNamespace;
    ioNamespace = this.cookies["uibuilder-namespace"];
    if (ioNamespace === void 0 || ioNamespace === "") {
      const u = window.location.pathname.split("/").filter(function(t) {
        return t.trim() !== "";
      });
      if (u.length > 0 && u[u.length - 1].endsWith(".html")) u.pop();
      ioNamespace = u.pop();
      log("trace", "uibuilder.module.js:getIOnamespace", "Socket.IO namespace found via url path: ".concat(ioNamespace))();
    } else {
      log("trace", "uibuilder.module.js:getIOnamespace", "Socket.IO namespace found via cookie: ".concat(ioNamespace))();
    }
    this.url = ioNamespace;
    ioNamespace = "/" + ioNamespace;
    log("trace", "uibuilder.module.js:getIOnamespace", "Final Socket.IO namespace: ".concat(ioNamespace))();
    return ioNamespace;
  }
  // --- End of set IO namespace --- //
  /** Function used to check whether Socket.IO is connected to the server, reconnect if not (recursive)
   * @param {number} [delay] Initial delay before checking (ms). Default=2000ms
   * @param {number} [factor] Multiplication factor for subsequent checks (delay*factor). Default=1.5
   * @param {number} [depth] Recursion depth
   * @returns {boolean|undefined} Whether or not Socket.IO is connected to uibuilder in Node-RED
   * @private
   */
  _checkConnect(delay, factor, depth = 1) {
    if (navigator.onLine === false) return;
    if (!delay) delay = this.retryMs;
    if (!factor) factor = this.retryFactor;
    log("trace", "Uib:checkConnect", "Checking connection.\nConnected: ".concat(this._socket.connected, ".\nTimer: ").concat(__privateGet(this, _timerid), ". Depth: ").concat(depth, ". Delay: ").concat(delay, ". Factor: ").concat(factor, ".\nTransport: ").concat(this.currentTransport), this._socket)();
    if (this._socket.connected === true) {
      if (__privateGet(this, _timerid)) {
        window.clearTimeout(__privateGet(this, _timerid));
        __privateSet(this, _timerid, null);
      }
      this.set("ioConnected", true);
      this.set("socketError", null);
      return true;
    }
    this.set("ioConnected", false);
    if (__privateGet(this, _timerid)) window.clearTimeout(__privateGet(this, _timerid));
    __privateSet(this, _timerid, window.setTimeout(() => {
      log("warn", "Uib:checkConnect:setTimeout", "Socket.IO reconnection attempt. Current delay: ".concat(delay, ". Depth: ").concat(depth))();
      this._socket.disconnect();
      this._socket.connect();
      __privateSet(this, _timerid, null);
      this._checkConnect(delay * factor, factor, depth++);
    }, delay));
    return false;
  }
  // --- End of checkConnect Fn--- //
  // See message handling section for msg receipt handlers
  /** Called by _ioSetup when Socket.IO connects to Node-RED
   * @private
   */
  _onConnect() {
    this.currentTransport = this._socket.io.engine.transport.name;
    log(
      "info",
      "Uib:ioSetup",
      "\u2705 SOCKET CONNECTED.\nConnection count: ".concat(this.connectedNum, ", Is a Recovery?: ").concat(this._socket.recovered, ".\nNamespace: ").concat(this.ioNamespace, "\nTransport: ").concat(this.currentTransport)
    )();
    this._dispatchCustomEvent("uibuilder:socket:connected", { numConnections: this.connectedNum, isRecovery: this._socket.recovered });
    this._socket.io.engine.on("upgrade", () => {
      this.currentTransport = this._socket.io.engine.transport.name;
      log(
        "trace",
        "Uib:_onConnect:onUpgrade",
        "SOCKET CONNECTION UPGRADED.\nConnection count: ".concat(this.connectedNum, ", Is a Recovery?: ").concat(this._socket.recovered, ".\nNamespace: ").concat(this.ioNamespace, "\nTransport: ").concat(this.currentTransport)
      )();
    });
    setTimeout(() => {
      if (this.currentTransport !== "websocket") {
        log(
          "error",
          "Uib:Connection",
          "Connected to Node-RED but NO SOCKET UPGRADE!\n\u27A1\uFE0F CHECK NETWORK and any PROXIES for issues. \u2B05\uFE0F\nConnection count: ".concat(this.connectedNum, ", Is a Recovery?: ").concat(this._socket.recovered, ".\nNamespace: ").concat(this.ioNamespace, "\nTransport: ").concat(this.currentTransport)
        )();
      }
    }, 2e3);
    this._checkConnect();
  }
  /** Called by _ioSetup when Socket.IO disconnects from Node-RED
   * @param {string} reason Disconnection title
   * @private
   */
  _onDisconnect(reason) {
    log("info", "Uib:ioSetup:socket-disconnect", "\u26D4 Socket Disconnected. Reason: ".concat(reason))();
    this._dispatchCustomEvent("uibuilder:socket:disconnected", reason);
    this._checkConnect();
  }
  /** Setup Socket.io
   * since v2.0.0-beta2 Moved to a function and called by the user (uibuilder.start()) so that namespace & path can be passed manually if needed
   * @returns {boolean} Attaches socket.io manager to self._socket and updates self.ioNamespace & self.ioPath as needed
   * @private
   */
  _ioSetup() {
    if (lookup2 === void 0) {
      log("error", "Uib:ioSetup", "Socket.IO client not loaded, Node-RED comms will not work")();
      return false;
    }
    if (this._socket) {
      log("trace", "Uib:ioSetup", "Removing listeners in preparation for redoing Socket.IO connections")();
      if (__privateGet(this, _timerid)) {
        window.clearTimeout(__privateGet(this, _timerid));
        __privateSet(this, _timerid, null);
      }
      this._socket.close();
      this._socket.offAny();
      this._socket = void 0;
      this.set("ioConnected", false);
    }
    this.socketOptions.path = this.ioPath;
    log("trace", "Uib:ioSetup", "About to create IO object. Transports: [".concat(this.socketOptions.transports.join(", "), "]"))();
    this._socket = lookup2(this.ioNamespace, this.socketOptions);
    this._connectGlobal();
    this._socket.on("connect", this._onConnect.bind(this));
    this._socket.on(this._ioChannels.server, this._stdMsgFromServer.bind(this));
    this._socket.on(this._ioChannels.control, this._ctrlMsgFromServer.bind(this));
    this._socket.on("disconnect", this._onDisconnect.bind(this));
    this._socket.on("connect_error", (err) => {
      if (navigator.onLine === false) return;
      log("error", "Uib:ioSetup:connect_error", "\u274C Socket.IO Connect Error. Reason: ".concat(err.message), err)();
      this.set("ioConnected", false);
      this.set("socketError", err);
      this._dispatchCustomEvent("uibuilder:socket:disconnected", err);
    });
    this._socket.on("error", (err) => {
      log("error", "Uib:ioSetup:error", "\u274C Socket.IO Error. Reason: ".concat(err.message), err)();
      this.set("ioConnected", false);
      this.set("socketError", err);
      this._dispatchCustomEvent("uibuilder:socket:disconnected", err);
    });
    this._socket.io.engine.on("connection_error", (err) => {
      log(
        "error",
        "Uib:ioSetup:io:engine:connection_error",
        err.code,
        // 3
        err.message,
        // "Bad request"
        err.context
        // { name: 'TRANSPORT_MISMATCH', transport: 'websocket', previousTransport: 'polling' }
      )();
    });
    this._checkConnect();
    return true;
  }
  // ---- End of ioSetup ---- //
  /** Connect to global namespace & create global listener that updates the `globalMsg` var
   * @private
   */
  _connectGlobal() {
    this._socketGlobal = lookup2("/", this.socketOptions);
    this._socketGlobal.onAny((...args) => {
      this.set("globalMsg", args.slice(0, -1));
    });
  }
  /** Manually (re)connect socket.io */
  connect() {
    this._socket.connect();
  }
  /** Manually disconnect socket.io and stop any auto-reconnect timer */
  disconnect() {
    this._socket.disconnect();
    if (__privateGet(this, _timerid)) window.clearTimeout(__privateGet(this, _timerid));
  }
  /** Start up Socket.IO comms and listeners
   * This has to be done separately because if running from a web page in a sub-folder of src/dist, uibuilder cannot
   * necessarily work out the correct ioPath to use.
   * Also, if cookies aren't permitted in the browser, both ioPath and ioNamespace may need to be specified.
   * @param {object} [options] The start options object.
   * @returns {void}
   */
  start(options) {
    log("trace", "Uib:start", "Starting")();
    if (__privateGet(this, _MsgHandler)) this.cancelChange("msg", __privateGet(this, _MsgHandler));
    if (this.started === true) {
      log("info", "Uib:start", "Start function already called. Resetting Socket.IO and msg handler.")();
    }
    log("log", "Uib:start", "Cookies: ", this.cookies, "\nClient ID: ".concat(this.clientId))();
    log("trace", "Uib:start", "ioNamespace: ", this.ioNamespace, "\nioPath: ".concat(this.ioPath))();
    if (options) {
      if (options.ioNamespace) this.set("ioNamespace", options.ioNamespace);
      if (options.ioPath) this.set("ioPath", options.ioPath);
      if (options.nopolling && this.socketOptions.transports[0] === "polling") this.socketOptions.transports.shift();
    }
    const [entry] = performance.getEntriesByType("navigation");
    this.set("lastNavType", entry.type);
    this.set("started", this._ioSetup());
    if (this.started === true) {
      log("trace", "Uib:start", "Start completed. Socket.IO client library loaded.")();
    } else {
      log("error", "Uib:start", "Start completed. ERROR: Socket.IO client library NOT LOADED.")();
    }
    this._watchHashChanges();
    if (window["Vue"]) {
      this.set("isVue", true);
      try {
        this.set("vueVersion", window["Vue"].version);
      } catch (e) {
      }
      log("trace", "Uib:start", "VueJS is loaded. Version: ".concat(this.vueVersion))();
    } else {
      log("trace", "Uib:start", "VueJS is not loaded.")();
    }
    if (window["DOMPurify"]) {
      this.set("purify", true);
      log("trace", "Uib:start", "DOMPurify is loaded.")();
    } else {
      log("trace", "Uib:start", "DOMPurify is not loaded.")();
    }
    if (window["markdownit"]) {
      this.set("markdown", true);
      log("trace", "Uib:start", "Markdown-IT is loaded.")();
    } else {
      log("trace", "Uib:start", "Markdown-IT is not loaded.")();
    }
    this.onChange("msg", (msg) => {
      if (__privateGet(this, _isShowMsg) === true) {
        const eMsg = document.getElementById("uib_last_msg");
        if (eMsg) eMsg.innerHTML = this.syntaxHighlight(msg);
      }
    });
    this._uibAttrScanAll(document);
    const observer = new MutationObserver(this._uibAttribObserver.bind(this));
    observer.observe(document, {
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: this.uibAttribs,
      childList: true
    });
    this._dispatchCustomEvent("uibuilder:startComplete");
  }
  // #endregion -------- ------------ -------- //
}, _pingInterval = new WeakMap(), _propChangeCallbacks = new WeakMap(), _msgRecvdByTopicCallbacks = new WeakMap(), _timerid = new WeakMap(), _MsgHandler = new WeakMap(), _isShowMsg = new WeakMap(), _isShowStatus = new WeakMap(), _sendUrlHash = new WeakMap(), _uniqueElID = new WeakMap(), _extCommands = new WeakMap(), _managedVars = new WeakMap(), _showStatus = new WeakMap(), _uiObservers = new WeakMap(), _uibAttrSel = new WeakMap(), // #region --- Static variables ---
__publicField(_a2, "_meta", {
  version,
  type: "module",
  displayName: "uibuilder"
}), _a2);
var uibuilder2 = new Uib();
if (!window["uibuilder"]) {
  window["uibuilder"] = uibuilder2;
} else {
  log("error", "uibuilder.module.js", "`uibuilder` already assigned to window. Have you tried to load it more than once?");
}
if (!window["uib"]) {
  window["uib"] = uibuilder2;
} else {
  log("warn", "uibuilder.module.js", "`uib` shortcut already assigned to window.");
}
if (!window["$"]) {
  window["$"] = window["uibuilder"].$;
} else {
  log("warn", "uibuilder.module.js", "Cannot allocate the global `$`, it is already in use. Use `uibuilder.$` or `uib.$` instead.");
}
if (!window["$$"]) {
  window["$$"] = window["uibuilder"].$$;
} else {
  log("warn", "uibuilder.module.js", "Cannot allocate the global `$$`, it is already in use. Use `uibuilder.$$` or `uib.$$` instead.");
}
if (!window["$ui"]) {
  window["$ui"] = window["uibuilder"].$ui;
} else {
  log("warn", "uibuilder.module.js", "Cannot allocate the global `$ui`, it is already in use. Use `uibuilder.$ui` or `uib.$ui` instead.");
}
if (!("on" in document)) {
  document.on = function(event2, callback) {
    this.addEventListener(event2, callback);
  };
}
if (!("on" in window)) {
  window.on = function(event2, callback) {
    this.addEventListener(event2, callback);
  };
}
try {
  if (!("query" in Element)) {
    Element.prototype.query = function(selector) {
      return this.querySelector(selector);
    };
  }
  if (!("queryAll" in Element)) {
    Element.prototype.queryAll = function(selector) {
      return this.querySelectorAll(selector);
    };
  }
  if (!("on" in Element)) {
    Element.prototype.on = function(event2, callback) {
      this.addEventListener(event2, callback);
    };
  }
} finally {
}
var uibuilder_module_default = uibuilder2;
uibuilder2.start();
customElements.define("uib-var", uib_var_default);
customElements.define("uib-meta", uib_meta_default);
customElements.define("apply-template", apply_template_default);
export {
  Uib,
  uibuilder_module_default as default,
  uibuilder2 as uibuilder
};
/**
 * @kind module
 * @module reactive
 * @description Reactive proxy implementation for uibuilder (Loosely based on Vue.js v3 reactivity)
 * @license Apache-2.0
 * @author Julian Knight (Totally Information)
 * @copyright (c) 2025 Julian Knight (Totally Information)
 */
/**
 * @kind module
 * @module uibuilder
 * @description The client-side Front-End JavaScript for uibuilder in HTML Module form
 *   It provides a number of global objects that can be used in your own javascript.
 *   see the docs folder `./docs/uibuilder.module.md` for details of how to use this fully.
 *
 *   Please use the default index.js file for your own code and leave this as-is.
 *   See Uib._meta for client version string
 * @license Apache-2.0
 * @author Julian Knight (Totally Information)
 * @copyright (c) 2022-2025 Julian Knight (Totally Information)
 */
