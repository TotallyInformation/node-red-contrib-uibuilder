var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

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
              return `<pre class="">
                                    <code class="hljs border">${window["hljs"].highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
            } finally {
            }
          }
          return `<pre class="hljs border"><code>${_a.md.utils.escapeHtml(str).trim()}</code></pre>`;
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
              return `<pre><code class="hljs border language-${lang}" data-language="${lang}" title="Source language: '${lang}'">${window["hljs"].highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
            } finally {
            }
          } else {
            try {
              const high = window["hljs"].highlightAuto(str);
              return `<pre><code class="hljs border language-${high.language}" data-language="${high.language}" title="Source language estimated by HighlightJS: '${high.language}'">${high.value}</code></pre>`;
            } finally {
            }
          }
        }
        return `<pre><code class="border">${_a.md.utils.escapeHtml(str).trim()}</code></pre>`;
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
      _a.log("trace", `Ui:_uiAdd:components-forEach:${i}`, "Component to add: ", compToAdd)();
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
        _a.log("trace", "_uiComposeComponent:attributes-forEach", `Attribute: '${attrib}', value: '${comp.attributes[attrib]}'`)();
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
            new Function("evt", `${comp.events[type]}(evt)`)(evt);
          });
        } catch (err) {
          _a.log("error", "Ui:_uiComposeComponent", `Add event '${type}' for element '${comp.type}': Cannot add event handler. ${err.message}`)();
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
      _a.log("trace", `Ui:_uiExtendEl:components-forEach:${i}`, compToAdd)();
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
        import(component);
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
        _a.log("error", "Ui:_uiManager", `No method defined for msg._ui[${i}]. Ignoring. `, ui)();
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
          _a.log("error", "Ui:_uiManager", `Invalid msg._ui[${i}].method (${ui.method}). Ignoring`)();
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
          _a.log("trace", "Ui:_uiRemove", `Could not remove. ${err.message}`)();
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
      _a.log("trace", `Ui:_uiReplace:components-forEach:${i}`, "Component to replace: ", compToReplace)();
      let elToReplace;
      if (compToReplace.id) {
        elToReplace = _a.doc.getElementById(compToReplace.id);
      } else if (compToReplace.selector || compToReplace.select) {
        elToReplace = _a.doc.querySelector(compToReplace.selector);
      } else if (compToReplace.name) {
        elToReplace = _a.doc.querySelector(`[name="${compToReplace.name}"]`);
      } else if (compToReplace.type) {
        elToReplace = _a.doc.querySelector(compToReplace.type);
      }
      _a.log("trace", `Ui:_uiReplace:components-forEach:${i}`, "Element to replace: ", elToReplace)();
      if (elToReplace === void 0 || elToReplace === null) {
        _a.log("trace", `Ui:_uiReplace:components-forEach:${i}:noReplace`, "Cannot find the DOM element. Adding instead.", compToReplace)();
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
      _a.log("trace", "_uiUpdate:components-forEach", `Start loop #${i}`, compToUpd)();
      let elToUpd;
      if (compToUpd.parentEl) {
        elToUpd = compToUpd.parentEl;
      } else if (compToUpd.id) {
        elToUpd = _a.doc.querySelectorAll(`#${compToUpd.id}`);
      } else if (compToUpd.selector || compToUpd.select) {
        elToUpd = _a.doc.querySelectorAll(compToUpd.selector);
      } else if (compToUpd.name) {
        elToUpd = _a.doc.querySelectorAll(`[name="${compToUpd.name}"]`);
      } else if (compToUpd.type) {
        elToUpd = _a.doc.querySelectorAll(compToUpd.type);
      }
      if (elToUpd === void 0 || elToUpd.length < 1) {
        _a.log("warn", "Ui:_uiManager:update", "Cannot find the DOM element. Ignoring.", compToUpd)();
        return;
      }
      _a.log("trace", "_uiUpdate:components-forEach", `Element(s) to update. Count: ${elToUpd.length}`, elToUpd)();
      if (!compToUpd.slot && compToUpd.payload) compToUpd.slot = compToUpd.payload;
      elToUpd.forEach((el, j) => {
        _a.log("trace", "_uiUpdate:components-forEach", `Updating element #${j}`, el)();
        this._uiComposeComponent(el, compToUpd);
        if (compToUpd.components) {
          _a.log("trace", "_uiUpdate:nested-component", `Element #${j} - nested-component`, compToUpd, el)();
          const nc = { _ui: [] };
          compToUpd.components.forEach((nestedComp, k) => {
            const method = nestedComp.method || compToUpd.method || ui.method;
            if (nestedComp.method) delete nestedComp.method;
            if (!Array.isArray(nestedComp)) nestedComp = [nestedComp];
            _a.log("trace", "_uiUpdate:nested-component", `Element #${j} - nested-component #${k}`, nestedComp)();
            nc._ui.push({
              method,
              parentEl: el,
              components: nestedComp
            });
          });
          _a.log("trace", "_uiUpdate:nested-component", `Element #${j} - nested-component new manager`, nc)();
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
      _a.log(1, "Uib:$", `Invalid context element. Must be a valid HTML element.`, context)();
      return null;
    }
    let el = context.querySelector(cssSelector);
    if (!el || !el.nodeType) {
      _a.log(1, "Uib:$", `No element found or element is not an HTML element for CSS selector ${cssSelector}`)();
      return null;
    }
    if (el.nodeName === "TEMPLATE") {
      el = el.content.firstElementChild;
      if (!el) {
        _a.log(0, "Uib:$", `Template selected for CSS selector ${cssSelector} but it is empty`)();
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
      _a.log(1, "Uib:$", `Could not process output type "${output}" for CSS selector ${cssSelector}, returned the DOM element. ${e.message}`, e)();
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
      _a.log(1, "Uib:$$", `Invalid context element. Must be a valid HTML element.`, context)();
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
    if (!config) config = {};
    if (!config.onceOnly) config.onceOnly = false;
    if (!config.mode) config.mode = "insert";
    const template = _a.doc.getElementById(sourceId);
    if (!template || template.tagName !== "TEMPLATE") {
      _a.log("error", "Ui:applyTemplate", `Source must be a <template>. id='${sourceId}'`)();
      return;
    }
    const target = _a.doc.getElementById(targetId);
    if (!target) {
      _a.log("error", "Ui:applyTemplate", `Target not found: id='${targetId}'`)();
      return;
    }
    const targetContent = target.innerHTML ?? "";
    if (targetContent && config.mode === "replace") {
      _a.log("warn", "Ui:applyTemplate", `Target element is not empty, content is replaced. id='${targetId}'`)();
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
      _a.log("warn", "Ui:applyTemplate", `No valid content found in template`)();
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
      _a.log(0, "uibuilder:convertMarkdown", `Could not render Markdown. ${e.message}`, e)();
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
  async include(url, uiOptions) {
    if (!fetch) {
      _a.log(0, "Ui:include", "Current environment does not include `fetch`, skipping.")();
      return "Current environment does not include `fetch`, skipping.";
    }
    if (!url) {
      _a.log(0, "Ui:include", "url parameter must be provided, skipping.")();
      return "url parameter must be provided, skipping.";
    }
    if (!uiOptions || !uiOptions.id) {
      _a.log(0, "Ui:include", "uiOptions parameter MUST be provided and must contain at least an `id` property, skipping.")();
      return "uiOptions parameter MUST be provided and must contain at least an `id` property, skipping.";
    }
    let response;
    try {
      response = await fetch(url);
    } catch (error) {
      _a.log(0, "Ui:include", `Fetch of file '${url}' failed. `, error.message)();
      return error.message;
    }
    if (!response.ok) {
      _a.log(0, "Ui:include", `Fetch of file '${url}' failed. Status='${response.statusText}'`)();
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
        slot = `<img src="${URL.createObjectURL(data)}">`;
        if (_a.win["DOMPurify"]) {
          txtReturn = "Include successful. BUT DOMPurify loaded which may block its use.";
          _a.log("warn", "Ui:include:image", txtReturn)();
        }
        break;
      }
      case "video": {
        data = await response.blob();
        slot = `<video controls autoplay><source src="${URL.createObjectURL(data)}"></video>`;
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
        slot = `<iframe style="resize:both;width:inherit;height:inherit;" src="${URL.createObjectURL(data)}">`;
        if (_a.win["DOMPurify"]) {
          txtReturn = "Include successful. BUT DOMPurify loaded which may block its use.";
          _a.log("warn", `Ui:include:${type}`, txtReturn)();
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
    _a.log("trace", `Ui:include:${type}`, txtReturn)();
    return txtReturn;
  }
  // ---- End of include() ---- //
  /** Attach a new remote script to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} url The url to be used in the script src attribute
   */
  loadScriptSrc(url) {
    const newScript = _a.doc.createElement("script");
    newScript.src = url;
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
  loadStyleSrc(url) {
    const newStyle = _a.doc.createElement("link");
    newStyle.href = url;
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
  loadui(url) {
    if (!fetch) {
      _a.log(0, "Ui:loadui", "Current environment does not include `fetch`, skipping.")();
      return;
    }
    if (!url) {
      _a.log(0, "Ui:loadui", "url parameter must be provided, skipping.")();
      return;
    }
    fetch(url).then((response) => {
      if (response.ok === false) {
        throw new Error(`Could not load '${url}'. Status ${response.status}, Error: ${response.statusText}`);
      }
      _a.log("trace", "Ui:loadui:then1", `Loaded '${url}'. Status ${response.status}, ${response.statusText}`)();
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError(`Fetch '${url}' did not return JSON, ignoring`);
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
      const listEntries = _a.doc.querySelectorAll(`${cssSelector} li`);
      if (listEntries) {
        thisOut.list = {
          "entries": listEntries.length
        };
      }
    }
    if (node.nodeName === "DL") {
      const listEntries = _a.doc.querySelectorAll(`${cssSelector} dt`);
      if (listEntries) {
        thisOut.list = {
          "entries": listEntries.length
        };
      }
    }
    if (node.nodeName === "TABLE") {
      const bodyEntries = _a.doc.querySelectorAll(`${cssSelector} > tbody > tr`);
      const headEntries = _a.doc.querySelectorAll(`${cssSelector} > thead > tr`);
      const cols = _a.doc.querySelectorAll(`${cssSelector} > tbody > tr:last-child > *`);
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
    let content = "";
    if (msg && msg.payload && typeof msg.payload === "string") content += `<div>${msg.payload}</div>`;
    if (ui.content) content += `<div>${ui.content}</div>`;
    if (content === "") {
      _a.log(1, "Ui:showDialog", "Toast content is blank. Not shown.")();
      return;
    }
    if (!ui.title && msg.topic) ui.title = msg.topic;
    if (ui.title) content = `<p class="toast-head">${ui.title}</p><p>${content}</p>`;
    if (ui.noAutohide) ui.noAutoHide = ui.noAutohide;
    if (ui.noAutoHide) ui.autohide = !ui.noAutoHide;
    if (ui.autoHideDelay) {
      if (!ui.autohide) ui.autohide = true;
      ui.delay = ui.autoHideDelay;
    } else ui.autoHideDelay = 1e4;
    if (!Object.prototype.hasOwnProperty.call(ui, "autohide")) ui.autohide = true;
    if (type === "alert") {
      ui.modal = true;
      ui.autohide = false;
      content = `<svg viewBox="0 0 192.146 192.146" style="width:30;background-color:transparent;"><path d="M108.186 144.372c0 7.054-4.729 12.32-12.037 12.32h-.254c-7.054 0-11.92-5.266-11.92-12.32 0-7.298 5.012-12.31 12.174-12.31s11.91 4.992 12.037 12.31zM88.44 125.301h15.447l2.951-61.298H85.46l2.98 61.298zm101.932 51.733c-2.237 3.664-6.214 5.921-10.493 5.921H12.282c-4.426 0-8.51-2.384-10.698-6.233a12.34 12.34 0 0 1 .147-12.349l84.111-149.22c2.208-3.722 6.204-5.96 10.522-5.96h.332c4.445.107 8.441 2.618 10.513 6.546l83.515 149.229c1.993 3.8 1.905 8.363-.352 12.066zm-10.493-6.4L96.354 21.454l-84.062 149.18h167.587z" /></svg> ${content}`;
    }
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
    toast.setAttribute("class", `toast ${ui.variant ? ui.variant : ""} ${type}`);
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
          else out.push(`Property '${propName}' not found`);
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
    if (rowKeys.length > 1e3) _a.log(1, "Uib:buildHtmlTable", `Warning, data is ${rowKeys.length} rows. Anything over 1,000 can get very slow to complete.`)();
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
          "key": col ?? i,
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
        throw new Error(`[ui.js:buildHtmlTable] Could not add table to parent. ${e.message}`);
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
    if (Object.prototype.toString.apply(options) !== "[object Object]") throw new Error(`[tblAddDataRow] options must be an object`);
    const dataType = Object.prototype.toString.apply(rowData);
    if (dataType !== "[object Object]" && dataType !== "[object Array]") throw new Error(`[tblAddDataRow] rowData MUST be an object or an array containing column/cell data for each column`);
    let tblEl;
    if (tblType === "[object HTMLTableElement]") {
      tblEl = tbl;
    } else {
      tblEl = _a.doc.querySelector(tbl);
      if (!tblEl) throw new Error(`[tblAddDataRow] Table with CSS Selector "${tbl}" not found`);
    }
    if (!options.body) options.body = 0;
    if (!("allowHTML" in options)) options.allowHTML = false;
    const tbodyEl = tblEl.getElementsByTagName("tbody")[options.body];
    if (!tbodyEl) throw new Error(`[tblAddDataRow] Table must have a tbody tag, tbody section ${options.body} does not exist`);
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
      let foundEl = cols.find((col) => col?.colMeta?.name === colKey);
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
    if (!table) throw new Error(`Table with CSS Selector "${tblSelector}" not found`);
    if (typeof out !== "object") throw new Error('The "out" argument MUST be an object');
    if (!options.eventScope) options.eventScope = "row";
    if (!options.returnType) options.returnType = "text";
    if (!options.eventType) options.eventType = "click";
    if (!options.pad) options.pad = 3;
    if (!options.logLevel) options.logLevel = 2;
    if (!("send" in options)) options.send = true;
    table.querySelector("tbody").addEventListener(options.eventType, (event) => {
      Object.keys(out).forEach((key) => delete out[key]);
      const clickedRow = event.target.closest("tr");
      const clickedCell = event.target.closest("td");
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
        _a.log(options.logLevel, "Ui:tblAddClickListener", `${options.eventScope} ${options.eventType} on row=${rowIndex}, col=${cellIndex}, data: `, out)();
        if (options.send === true && _a.win["uibuilder"]) _a.win["uibuilder"].send({
          topic: `${tblSelector} ${options.eventScope} ${options.eventType}`,
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
    return cellEl.getAttribute("data-col-name") ?? `C${String(cellEl.cellIndex + 1).padStart(pad, "0")}`;
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
    if (!options.pad) options.pad = 3;
    if (tblEl.cols) return tblEl.cols;
    let cols = tblEl.querySelector("tr[data-col-reference]")?.children;
    if (!cols) cols = tblEl.querySelector("thead>tr:first-of-type")?.children;
    if (!cols) cols = tblEl.querySelector("tr:first-of-type")?.children;
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
      const colKey = hasName ? colName : `C${String(cellEl.cellIndex + 1).padStart(options.pad, "0")}`;
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
    if (Object.prototype.toString.apply(options) !== "[object Object]") throw new Error(`[tblRemoveRow] options must be an object`);
    let tblEl;
    if (tblType === "[object HTMLTableElement]") {
      tblEl = tbl;
    } else {
      tblEl = _a.doc.querySelector(tbl);
      if (!tblEl) throw new Error(`[tblRemoveRow] Table with CSS Selector "${tbl}" not found`);
    }
    if (!options.body) options.body = 0;
    const tbodyEl = tblEl.getElementsByTagName("tbody")[options.body];
    if (!tbodyEl) throw new Error(`[tblAddDataRow] Table must have a tbody tag, tbody section ${options.body} does not exist`);
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
export {
  ui_default as default
};
